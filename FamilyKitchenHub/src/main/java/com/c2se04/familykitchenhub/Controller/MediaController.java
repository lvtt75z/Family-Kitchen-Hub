package com.c2se04.familykitchenhub.Controller;

import com.c2se04.familykitchenhub.DTO.Response.MediaUploadResponseDTO;
import com.c2se04.familykitchenhub.Service.MediaStorageService;
import com.c2se04.familykitchenhub.enums.MediaType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/media")
public class MediaController {

    private final MediaStorageService mediaStorageService;

    @Autowired
    public MediaController(MediaStorageService mediaStorageService) {
        this.mediaStorageService = mediaStorageService;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> upload(@RequestParam(value = "file", required = false) MultipartFile file,
                                     @RequestParam(value = "files", required = false) List<MultipartFile> files,
                                     @RequestParam(defaultValue = "IMAGE") MediaType type) {
        try {
            // Support both single file and multiple files
            if (files != null && !files.isEmpty()) {
                List<MediaUploadResponseDTO> responses = mediaStorageService.storeMultiple(files, type);
                return new ResponseEntity<>(responses, HttpStatus.CREATED);
            } else if (file != null && !file.isEmpty()) {
                MediaUploadResponseDTO response = mediaStorageService.store(file, type);
                return new ResponseEntity<>(response, HttpStatus.CREATED);
            } else {
                return ResponseEntity.badRequest().body("No file provided");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error uploading file: " + e.getMessage());
        }
    }
}

