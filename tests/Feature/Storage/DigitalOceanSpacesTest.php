<?php

namespace Tests\Feature\Storage;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class DigitalOceanSpacesTest extends TestCase
{
    /**
     * Test that DO Spaces disk is configured correctly
     */
    public function test_do_spaces_disk_exists(): void
    {
        $config = config('filesystems.disks.do_spaces');
        
        $this->assertIsArray($config);
        $this->assertEquals('s3', $config['driver']);
        $this->assertEquals('private', $config['visibility']);
        $this->assertTrue($config['throw']);
    }

    /**
     * Test DO Spaces file upload (requires credentials in .env)
     * 
     * This test will be skipped if DO_SPACES_KEY is not configured.
     * To run this test, add your DO Spaces credentials to .env:
     * 
     * DO_SPACES_KEY=your_key
     * DO_SPACES_SECRET=your_secret
     * DO_SPACES_REGION=nyc3
     * DO_SPACES_BUCKET=your_bucket
     * DO_SPACES_ENDPOINT=https://nyc3.digitaloceanspaces.com
     */
    public function test_can_upload_to_do_spaces(): void
    {
        if (empty(config('filesystems.disks.do_spaces.key'))) {
            $this->markTestSkipped('DO_SPACES_KEY not configured. Add credentials to .env to run this test.');
        }

        $disk = Storage::disk('do_spaces');
        $file = UploadedFile::fake()->image('test-finance-attachment.jpg', 100, 100);
        $path = 'test-uploads/' . uniqid('test_', true) . '.jpg';

        // Upload
        $uploaded = $disk->put($path, $file->getContent());
        $this->assertTrue($uploaded);
        
        // Verify exists
        $this->assertTrue($disk->exists($path));

        // Verify can read
        $content = $disk->get($path);
        $this->assertNotEmpty($content);

        // Generate temporary URL (15 min)
        $url = $disk->temporaryUrl($path, now()->addMinutes(15));
        $this->assertStringContainsString('digitaloceanspaces.com', $url);
        $this->assertStringContainsString('X-Amz-Signature', $url); // Signed URL

        // Cleanup
        $disk->delete($path);
        $this->assertFalse($disk->exists($path));
    }

    /**
     * Test that local 'public' disk is NOT used for finance attachments
     */
    public function test_finance_controller_uses_do_spaces(): void
    {
        $controllerPath = app_path('Http/Controllers/Finance/AttachmentController.php');
        $contents = file_get_contents($controllerPath);

        // Ensure controller references 'do_spaces', not 'public'
        $this->assertStringContainsString("'do_spaces'", $contents);
        $this->assertStringContainsString('Storage::disk(\'do_spaces\')', $contents);
        
        // Ensure old 'public' disk references are removed (check for the specific bad pattern)
        $this->assertStringNotContainsString('\'public\')', $contents, 'Found old public disk usage');
    }
}
