// app/profile/edit.tsx
import { Stack, router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useProfile } from "../context/ProfileContext";

export default function EditProfile() {
  const { profile, updateProfile, loading } = useProfile();
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [age, setAge] = useState(String(profile.age));
  const [height_ft, setHeightFt] = useState(String(profile.height_ft));
  const [height_in, setHeightIn] = useState(String(profile.height_in));
  const [weight, setWeight] = useState(String(profile.weight));

  // If profile finishes loading later (first mount), sync local form once.
  useEffect(() => {
    if (!loading) {
      setName(profile.name);
      setEmail(profile.email);
      setAge(String(profile.age));
      setHeightFt(String(profile.height_ft));
      setHeightIn(String(profile.height_in));
      setWeight(String(profile.weight));
    }
  }, [loading]);

  const onSave = async () => {
    const next = {
      name: name.trim(),
      email: email.trim(),
      age: Number(age) || 0,
      height_ft: Number(height_ft) || 0,
      height_in: Number(height_in) || 0,
      weight: Number(weight) || 0,
    };
    await updateProfile(next);
    Alert.alert("Saved", "Profile updated.");
    router.back();
  };

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: "Edit Profile", headerStyle: { backgroundColor: "#06060f" }, headerTintColor: "#fff" }} />

      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <TextInput value={name} onChangeText={setName} placeholder="Name" placeholderTextColor="#7a7f87" style={styles.input} />

        <Text style={styles.label}>Email</Text>
        <TextInput value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" autoCapitalize="none" placeholderTextColor="#7a7f87" style={styles.input} />

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
            style={[styles.input, { flex: 1 }]}
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

        <Text style={styles.label}>Weight (lb)</Text>
        <TextInput value={weight} onChangeText={setWeight} placeholder="185" keyboardType="numeric" placeholderTextColor="#7a7f87" style={styles.input} />
      </View>

      <Pressable style={[styles.saveBtn, loading && { opacity: 0.5 }]} disabled={loading} onPress={onSave}>
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
