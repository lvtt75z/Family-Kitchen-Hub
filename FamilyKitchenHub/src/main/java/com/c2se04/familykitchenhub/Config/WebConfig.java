package com.c2se04.familykitchenhub.Config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.media.storage-dir:uploads}")
    private String mediaStorageDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path storagePath = Paths.get(mediaStorageDir).toAbsolutePath().normalize();
        String location = storagePath.toUri().toString();
        registry.addResourceHandler("/media/**")
                .addResourceLocations(location);
    }
}

