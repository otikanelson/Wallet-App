import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  FlatList,
  ViewToken,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/common/Button';
import { colors, typography, spacing, borderRadius } from '@/constants/theme';

const { width } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  image: any | null;
}

const slides: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Welcome to CFC Wallet',
    description:
      'The easiest way to buy airtime, data, and utility services – anytime, anywhere.',
    image: require('../../../assets/images/Illustration.png'),
  },
  {
    id: '2',
    title: 'Buy Airtime & Data Instantly',
    description:
      'Recharge any network in Nigeria instantly. Save time with our quick top-up feature.',
    image: require('../../../assets/images/Top_up.png'),
  },
  {
    id: '3',
    title: 'Pay Your Bills',
    description:
      'Pay electricity bills and cable TV subscriptions with ease. All in one place.',
    image: require('../../../assets/images/tv.png'),
  },
];

interface WelcomeScreenProps {
  navigation: any; // expo-router's router object
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation: router }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        setCurrentIndex(viewableItems[0].index || 0);
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderSlide = ({ item }: { item: OnboardingSlide }) => (
    <View style={styles.slide}>
      <View style={styles.imageContainer}>
        {item.image ? (
          <Image
            source={item.image}
            style={styles.image}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>📱</Text>
          </View>
        )}
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  const renderDots = () => (
    <View style={styles.dotsContainer}>
      {slides.map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index === currentIndex && styles.activeDot,
          ]}
        />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        keyExtractor={(item) => item.id}
      />

      {renderDots()}

      <View style={styles.buttonContainer}>
        <Button
          onPress={() => router.push('/(auth)/login')}
          variant="primary"
          style={styles.button}
        >
          Login
        </Button>
        <Button
          onPress={() => router.push('/(auth)/register')}
          variant="outline"
          style={styles.button}
        >
          Register
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  slide: {
    width,
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  imageContainer: {
    width: width * 0.8,
    height: width * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  title: {
    ...typography.h2,
    color: colors.secondary,
    textAlign: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  description: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: colors.primary,
  },
  buttonContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  button: {
    marginBottom: spacing.md,
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.cardBlue,
    borderRadius: borderRadius.lg,
  },
  placeholderText: {
    fontSize: 80,
  },
});
