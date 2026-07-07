<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\FinanceAttachment;
use App\Models\Income;
use App\Models\ServiceIncome;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AttachmentController extends Controller
{
    /**
     * Map of type slug to model class.
     */
    private array $typeMap = [
        'income'         => Income::class,
        'expense'        => Expense::class,
        'service_income' => ServiceIncome::class,
    ];

    public function store(Request $request)
    {
        $request->validate([
            'attachable_type' => ['required', 'string', 'in:income,expense,service_income'],
            'attachable_id'   => ['required', 'integer'],
            'files'           => ['required', 'array', 'min:1'],
            'files.*'         => ['file', 'mimes:jpg,jpeg,png,pdf,webp', 'max:5120'],
            'note'            => ['nullable', 'string', 'max:500'],
        ]);

        $churchId  = auth()->user()->church_id;
        $modelClass = $this->typeMap[$request->attachable_type];

        // Find the record and verify it belongs to this church
        $record = $modelClass::withoutGlobalScopes()
            ->where('church_id', $churchId)
            ->findOrFail($request->attachable_id);

        $count = 0;
        foreach ($request->file('files') as $file) {
            $filename = uniqid('fa_', true) . '.' . $file->getClientOriginalExtension();
            $path     = $file->storeAs("finance-attachments/{$churchId}", $filename, 'do_spaces');

            FinanceAttachment::create([
                'church_id'       => $churchId,
                'attachable_type' => get_class($record),
                'attachable_id'   => $record->id,
                'filename'        => $filename,
                'original_name'   => $file->getClientOriginalName(),
                'mime_type'       => $file->getMimeType(),
                'size'            => $file->getSize(),
                'path'            => $path,
                'uploaded_by'     => auth()->id(),
                'note'            => $request->note,
            ]);

            $count++;
        }

        return back()->with('success', "{$count} attachment(s) uploaded.");
    }

    public function destroy(FinanceAttachment $attachment)
    {
        abort_if($attachment->church_id !== auth()->user()->church_id, 403);

        Storage::disk('do_spaces')->delete($attachment->path);
        $attachment->delete();

        return back()->with('success', 'Attachment deleted.');
    }

    public function show(FinanceAttachment $attachment)
    {
        abort_if($attachment->church_id !== auth()->user()->church_id, 403);

        $disk = Storage::disk('do_spaces');

        abort_unless($disk->exists($attachment->path), 404);

        // Generate a short-lived temporary URL (15 min) instead of streaming through the server
        $url = $disk->temporaryUrl($attachment->path, now()->addMinutes(15), [
            'ResponseContentDisposition' => 'inline; filename="' . $attachment->original_name . '"',
            'ResponseContentType'        => $attachment->mime_type,
        ]);

        return redirect($url);
    }
}
