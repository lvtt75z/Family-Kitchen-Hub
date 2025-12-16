package com.c2se04.familykitchenhub.Service;

import com.c2se04.familykitchenhub.DTO.Response.MediaUploadResponseDTO;
import com.c2se04.familykitchenhub.Exception.BadRequestException;
import com.c2se04.familykitchenhub.enums.MediaType;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class MediaStorageService {

    private final Path storagePath;
    private final String publicBaseUrl;

    public MediaStorageService(@Value("${app.media.storage-dir:uploads}") String storageDir,
                               @Value("${app.media.base-url:/media}") String baseUrl) {
        this.storagePath = Paths.get(storageDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.storagePath);
        } catch (IOException e) {
            throw new IllegalStateException("Không thể tạo thư mục lưu media: " + storageDir, e);
        }
        this.publicBaseUrl = baseUrl.endsWith("/") ? baseUrl : baseUrl + "/";
    }

    public MediaUploadResponseDTO store(MultipartFile file, MediaType type) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File upload không hợp lệ");
        }
        MediaType resolvedType = type != null ? type : MediaType.IMAGE;
        String original = file.getOriginalFilename();
        String extension = StringUtils.getFilenameExtension(original);
        String safeName = UUID.randomUUID().toString();
        if (StringUtils.hasText(extension)) {
            safeName = safeName + "." + extension;
        }

        Path destination = storagePath.resolve(safeName);
        try {
            Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ex) {
            throw new IllegalStateException("Lưu file thất bại", ex);
        }

        String url = publicBaseUrl + safeName;
        return new MediaUploadResponseDTO(safeName, url, file.getSize(), resolvedType);
    }

    /**
     * Upload multiple files
     */
    public java.util.List<MediaUploadResponseDTO> storeMultiple(java.util.List<MultipartFile> files, MediaType type) {
        if (files == null || files.isEmpty()) {
            throw new BadRequestException("Danh sách file upload không hợp lệ");
        }
        return files.stream()
                .map(file -> store(file, type))
                .collect(java.util.stream.Collectors.toList());
    }
}

