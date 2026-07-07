<?php

namespace App\Concerns;

trait SanitizesCsv
{
    /**
     * Sanitize a CSV cell to prevent formula injection attacks.
     * 
     * Prefixes cells starting with =, +, -, @, \t, \r with a single quote.
     * 
     * @see https://owasp.org/www-community/attacks/CSV_Injection
     */
    protected function sanitizeCsvCell(?string $value): string
    {
        if ($value === null || $value === '') {
            return '';
        }

        $value = (string) $value;
        $firstChar = $value[0] ?? '';

        // Dangerous characters that can trigger formula execution
        if (in_array($firstChar, ['=', '+', '-', '@', "\t", "\r"], true)) {
            return "'" . $value;
        }

        return $value;
    }

    /**
     * Sanitize an entire row of CSV data.
     */
    protected function sanitizeCsvRow(array $row): array
    {
        return array_map(fn ($cell) => $this->sanitizeCsvCell($cell), $row);
    }

    /**
     * Convert a sanitized row to a CSV-escaped string.
     */
    protected function rowToCsv(array $row): string
    {
        return implode(',', array_map(function ($cell) {
            $sanitized = $this->sanitizeCsvCell($cell);
            // Quote and escape double quotes
            return '"' . str_replace('"', '""', $sanitized) . '"';
        }, $row));
    }
}
