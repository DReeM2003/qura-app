// app/profile/edit.tsx
import { Stack, router } from "expo-router";
import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export default function EditProfile() {
  const [name, setName] = useState("Derek");
  const [email, setEmail] = useState("derek@example.com");
  const [age, setAge] = useState(22);
  const [height_ft, setHeightFt] = useState(6);
  const [height_in, setHeightIn] = useState(0);
  const [weight, setWeight] = useState(185);


  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: "Edit Profile", headerStyle: { backgroundColor: "#06060f" }, headerTintColor: "#fff" }} />

      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <TextInput value={name} onChangeText={setName} placeholder="Name" placeholderTextColor="#7a7f87" style={styles.input} />

        <Text style={styles.label}>Email</Text>
        <TextInput value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" placeholderTextColor="#7a7f87" style={styles.input} />

        <Text style={styles.label}>Age</Text>
        <TextInput value={age} onChangeText={setAge} placeholder="22" keyboardType="numeric" placeholderTextColor="#7a7f87" style={styles.input} />

        <Text style={styles.label}>Height (ft:in) </Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
            
            <TextInput
                value={height_ft}
                onChangeText={setHeightFt}
                placeholder="6"
                keyboardType="numeric"
                placeholderTextColor="#7a7f87"
                style={[styles.input, { flex: 1 }]} // flex so both share space
            />
            <TextInput
                value={height_in}
                onChangeText={setHeightIn}
                placeholder="0"
                keyboardType="numeric"
                placeholderTextColor="#7a7f87"
                style={[styles.input, { flex: 1 }]}
            />
        </View>

        <Text style={styles.label}>Weight</Text>
        <TextInput value={weight} onChangeText={setWeight} placeholder="185" keyboardType="numeric" placeholderTextColor="#7a7f87" style={styles.input} />      
      </View>

      <Pressable
        style={styles.saveBtn}
        onPress={() => {
          // TODO: persist to storage/server
          const profile = {
                name,
                email,
                age: Number(age),
                height_ft: Number(height_ft),
                height_in: Number(height_in),
                weight: Number(weight),
            };
          console.log("Saving profile:", profile);
          Alert.alert("Saved", "Profile updated.");
          router.push("/");
        }}
      >
        <Text style={styles.saveText}>Save</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#06060f", padding: 16 },
  card: { backgroundColor: "#16161f", borderRadius: 16, padding: 16 },
  label: { color: "#ff2ec4", fontSize: 12, marginTop: 10, marginBottom: 6 },
  input: {
    backgroundColor: "#0f0f16",
    color: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  saveBtn: {
    marginTop: 16,
    backgroundColor: "#ff2ec4",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  saveText: { color: "#0a0a0f", fontWeight: "800", fontSize: 16 },
});
