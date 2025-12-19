package com.c2se04.familykitchenhub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class FamilyKitchenHubApplication {

	public static void main(String[] args) {
		SpringApplication.run(FamilyKitchenHubApplication.class, args);
	}

}
