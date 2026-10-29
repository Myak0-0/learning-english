<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AudioController extends Controller
{
    public function streamAudio(Request $request, $filename)
    {    
        $path = public_path('audios/' . $filename); 

        if (!file_exists($path)) {
            abort(404, 'Файл не найден в public/');
        }

        $fileSize = filesize($path);
        $stream = fopen($path, 'rb');
        
        $range = $request->header('Range');
        $start = 0;
        $end = $fileSize - 1;

        if ($range) {
            list($param, $rangeString) = explode('=', $range);
            list($startString, $endString) = explode('-', $rangeString);
            
            $start = intval($startString);
            if (!empty($endString)) {
                $end = intval($endString);
            }
        }

        $length = $end - $start + 1;

        $headers = [
            'Content-Type'        => 'audio/mpeg',
            'Content-Length'      => $length,
            'Content-Range'       => 'bytes ' . $start . '-' . $end . '/' . $fileSize,
            'Accept-Ranges'       => 'bytes',
            'Cache-Control'       => 'public, must-revalidate',
            'Content-Disposition' => 'inline; filename="' . $filename . '"',
        ];

        return response()->stream(function () use ($stream, $start, $length) {
            fseek($stream, $start);
            echo fread($stream, $length);
            fclose($stream);
        }, 206, $headers);
    }
}
