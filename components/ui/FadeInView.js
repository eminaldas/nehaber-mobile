import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

// Mount'ta hafif fade + yukarı kayma — profesyonel giriş animasyonu
export default function FadeInView({ children, delay = 0, offset = 10, duration = 320, style }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration,
      delay,
      useNativeDriver: true,
    }).start();
  }, [progress, delay, duration]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress,
          transform: [{
            translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [offset, 0] }),
          }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
