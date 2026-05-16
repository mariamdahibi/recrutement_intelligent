package com.example.projettut.service;

import com.example.projettut.entity.User;
import com.example.projettut.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User save(User user) {
        return userRepository.save(user);
    }

    public List<User> getAll() {
        return userRepository.findAll();
    }
    public User getById(Long id) {
        return userRepository.findById(id).orElse(null);
    }
    public User updateUser(Long id, User newUser) {

        User existingUser = userRepository.findById(id).orElse(null);

        if (existingUser != null) {
            existingUser.setName(newUser.getName());
            existingUser.setEmail(newUser.getEmail());
            existingUser.setPassword(newUser.getPassword());
            existingUser.setRole(newUser.getRole());

            return userRepository.save(existingUser);
        }

        return null;
    }
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}