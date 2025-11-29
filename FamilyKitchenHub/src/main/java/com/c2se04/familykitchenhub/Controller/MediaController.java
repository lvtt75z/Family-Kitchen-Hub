package com.c2se04.familykitchenhub.Controller;

import com.c2se04.familykitchenhub.DTO.Response.MediaUploadResponseDTO;
import com.c2se04.familykitchenhub.Service.MediaStorageService;
import com.c2se04.familykitchenhub.enums.MediaType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/media")
public class MediaController {

    private final MediaStorageService mediaStorageService;

    @Autowired
    public MediaController(MediaStorageService mediaStorageService) {
        this.mediaStorageService = mediaStorageService;
    }

    @PostMapping("/upload")
    public ResponseEntity<MediaUploadResponseDTO> upload(@RequestParam("file") MultipartFile file,
                                                         @RequestParam(defaultValue = "IMAGE") MediaType type) {
        MediaUploadResponseDTO response = mediaStorageService.store(file, type);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
}

