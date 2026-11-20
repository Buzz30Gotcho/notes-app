package com.example.notes.auth;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
public class User {
        @Id
        private String id;
        private String firstName;
        private String lastName;
        @Column(unique = true, nullable = false)
        private String email;
        private String passwordHash;

        public User() {
        }

        public User(String id, String firstName, String lastName, String email, String passwordHash) {
                this.id = id;
                this.firstName = firstName;

                this.lastName = lastName;
                this.email = email;
                this.passwordHash = passwordHash;
        }

        public String getId() {
                return id;
        }

        public void setId(String id) {
                this.id = id;
        }

        public String getFirstName() {
                return firstName;
        }

        public void setFirstName(String firstName) {
                this.firstName = firstName;
        }

        public String getLastName() {
                return lastName;
        }

        public void setLastName(String lastName) {
                this.lastName = lastName;
        }

        public String getEmail() {
                return email;
        }

        public void setEmail(String email) {
                this.email = email;
        }

        public String getPasswordHash() {
                return passwordHash;
        }

        public void setPasswordHash(String passwordHash) {
                this.passwordHash = passwordHash;
        }

}
