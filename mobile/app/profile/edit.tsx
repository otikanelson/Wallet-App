import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as ImagePicker from 'expo-image-picker';
import { colors, typography, spacing, borderRadius } from '@/constants/theme';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Toast } from '@/components/common/Toast';
import { useUserStore } from '@/store/userStore';
import { userAPI } from '@/api/user.api';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phoneNumber: z.string().regex(/^\d{11}$/, 'Phone number must be 11 digits'),
  address: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function EditProfile() {
  const router = useRouter();
  const { user, updateUser, isLoading } = useUserStore();
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as any });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (user) {
      setValue('name', user.name || '');
      setValue('phoneNumber', user.phoneNumber || '');
      setValue('address', user.address || '');
    }
  }, [user]);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setToast({ visible: true, message, type });
  };

  const handleChangePhoto = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant permission to access your photo library.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Launch image picker with lower quality for smaller file size
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images' as any,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7, // Good balance between quality and size
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setUploadingPhoto(true);
        const imageUri = result.assets[0].uri;
        
        // Convert image to base64
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const reader = new FileReader();
        
        reader.onloadend = async () => {
          try {
            const base64data = reader.result as string;
            
            // Upload to backend (which will upload to Cloudinary)
            const uploadResponse = await userAPI.updateProfilePicture(base64data);
            
            // The backend returns the Cloudinary URL
            const cloudinaryUrl = uploadResponse?.data?.profilePicture || base64data;
            
            // Update local user store with Cloudinary URL
            await updateUser({ profilePicture: cloudinaryUrl });
            showToast('Profile picture updated successfully!', 'success');
          } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to upload photo. Please try again.';
            showToast(errorMessage, 'error');
          } finally {
            setUploadingPhoto(false);
          }
        };
        
        reader.readAsDataURL(blob);
      }
    } catch (error) {
      showToast('Failed to select photo. Please try again.', 'error');
      setUploadingPhoto(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await updateUser(data);
      showToast('Profile updated successfully!', 'success');
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error) {
      showToast('Failed to update profile. Please try again.', 'error');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ ...toast, visible: false })}
      />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Picture */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            {user?.profilePicture ? (
              <Image
                source={{ uri: user.profilePicture }}
                style={styles.avatarImage}
              />
            ) : (
              <Ionicons name="person" size={40} color={colors.primary} />
            )}
          </View>
          <TouchableOpacity 
            style={styles.changePhotoButton} 
            onPress={handleChangePhoto}
            disabled={uploadingPhoto}
          >
            {uploadingPhoto ? (
              <>
                <Ionicons name="hourglass-outline" size={20} color={colors.primary} />
                <Text style={styles.changePhotoText}>Uploading...</Text>
              </>
            ) : (
              <>
                <Ionicons name="camera" size={20} color={colors.primary} />
                <Text style={styles.changePhotoText}>Change Photo</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Full Name"
                placeholder="Enter your full name"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.name?.message}
                leftIcon="person-outline"
              />
            )}
          />

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.disabledInput}>
              <Ionicons name="mail-outline" size={20} color={colors.text.disabled} />
              <Text style={styles.disabledInputText}>{user?.email}</Text>
            </View>
            <Text style={styles.hint}>Email cannot be changed</Text>
          </View>

          <Controller
            control={control}
            name="phoneNumber"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Phone Number"
                placeholder="08012345678"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.phoneNumber?.message}
                leftIcon="call-outline"
                keyboardType="phone-pad"
                maxLength={11}
              />
            )}
          />

          <Controller
            control={control}
            name="address"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Address (Optional)"
                placeholder="Enter your address"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.address?.message}
                leftIcon="location-outline"
              />
            )}
          />

          <Button
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            style={styles.saveButton}
          >
            Save Changes
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  changePhotoText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  form: {
    gap: spacing.md,
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.body,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  disabledInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  disabledInputText: {
    ...typography.body,
    color: colors.text.disabled,
    flex: 1,
  },
  hint: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  saveButton: {
    marginTop: spacing.md,
  },
});
