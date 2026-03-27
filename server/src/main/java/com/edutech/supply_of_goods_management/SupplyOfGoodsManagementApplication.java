package com.edutech.supply_of_goods_management;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = "com.edutech.supply_of_goods_management")
@EnableJpaRepositories(basePackages = "com.edutech.supply_of_goods_management.repository")
@EntityScan(basePackages = "com.edutech.supply_of_goods_management.entity")
public class SupplyOfGoodsManagementApplication {
    public static void main(String[] args) {
        SpringApplication.run(SupplyOfGoodsManagementApplication.class, args);
    }
}