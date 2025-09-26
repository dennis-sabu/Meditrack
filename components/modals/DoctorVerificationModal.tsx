import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { useGeneratePin } from '../../hooks/useGeneratePin';
import { Button, Card } from '../core';

const { width: screenWidth } = Dimensions.get('window');

interface DoctorVerificationModalProps {
  visible: boolean;
  onClose: () => void;
}

export const DoctorVerificationModal: React.FC<DoctorVerificationModalProps> = ({
  visible,
  onClose,
}) => {
  const { generatePin, isGenerating, pin, error, reset } = useGeneratePin();
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    if (pin?.expiresAt) {
      const expirationTime = new Date(pin.expiresAt).getTime();
      const now = new Date().getTime();
      const initialTimeLeft = Math.max(0, Math.floor((expirationTime - now) / 1000));
      setTimeLeft(initialTimeLeft);

      const timer = setInterval(() => {
        const currentTime = new Date().getTime();
        const remaining = Math.max(0, Math.floor((expirationTime - currentTime) / 1000));
        setTimeLeft(remaining);

        if (remaining === 0) {
          clearInterval(timer);
          reset();
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [pin, reset]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', 'Failed to generate PIN. Please try again.');
    }
  }, [error]);

  const handleClose = () => {
    reset();
    setTimeLeft(0);
    onClose();
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatPin = (pinString: string) => {
    return pinString.split('').join(' ');
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  useEffect(() => {
    if (visible && pin) {
      startPulseAnimation();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [visible, pin]);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Animated.View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.headerLeft}>
                <View style={styles.headerIcon}>
                  <Ionicons name="share-outline" size={20} color={Colors.primary} />
                </View>
                <Text style={styles.headerTitle}>Share Health Data</Text>
              </View>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.content}>
            {!pin ? (
              // Initial State
              <View style={styles.initialContainer}>
                <Card style={styles.initialCard}>
                  <View style={styles.shieldContainer}>
                    <Animated.View style={[styles.shieldGlow, { transform: [{ scale: pulseAnim }] }]} />
                    <View style={styles.shieldIcon}>
                      <Ionicons name="shield-checkmark" size={48} color={Colors.primary} />
                    </View>
                  </View>

                  <Text style={styles.initialTitle}>
                    Generate Secure PIN
                  </Text>

                  <Text style={styles.initialSubtitle}>
                    Create a temporary 6-digit PIN that your doctor can use to securely access your health metrics and prescription data.
                  </Text>

                  {/* Security Features */}
                  <View style={styles.securityContainer}>
                    <View style={styles.securityHeaderContainer}>
                      <Ionicons name="lock-closed" size={16} color={Colors.primary} />
                      <Text style={styles.securityHeaderText}>Security Features</Text>
                    </View>
                    <View style={styles.securityFeatures}>
                      <View style={styles.securityFeature}>
                        <Ionicons name="time-outline" size={16} color={Colors.primary} />
                        <Text style={styles.securityText}>Auto-expires in 5 minutes</Text>
                      </View>
                      <View style={styles.securityFeature}>
                        <Ionicons name="key-outline" size={16} color={Colors.primary} />
                        <Text style={styles.securityText}>Single-use access only</Text>
                      </View>
                      <View style={styles.securityFeature}>
                        <Ionicons name="eye-off-outline" size={16} color={Colors.primary} />
                        <Text style={styles.securityText}>No personal data exposed</Text>
                      </View>
                    </View>
                  </View>

                  <Button
                    title={isGenerating ? "Generating PIN..." : "Generate Secure PIN"}
                    onPress={() => generatePin()}
                    loading={isGenerating}
                    style={styles.generateButton}
                  />
                </Card>
              </View>
            ) : (
              // PIN Generated State
              <View style={styles.pinContainer}>
                <Card style={styles.pinCard}>
                  <View style={styles.successContainer}>
                    <View style={styles.successIcon}>
                      <Ionicons name="checkmark-circle" size={48} color={Colors.success} />
                    </View>
                    <Text style={styles.successTitle}>
                      PIN Generated Successfully!
                    </Text>
                    <Text style={styles.successSubtitle}>
                      Share this PIN with your doctor
                    </Text>
                  </View>

                  {/* PIN Display */}
                  <Animated.View style={[
                    styles.pinDisplay,
                    // { transform: [{ scale: pulseAnim }] }
                  ]}>
                    <View style={styles.pinBackground}>
                      <Text style={styles.pinText}>
                        {formatPin(pin.pin)}
                      </Text>
                    </View>
                  </Animated.View>

                  {/* Timer */}
                  <View style={styles.timerContainer}>
                    <View style={styles.timerIcon}>
                      <Ionicons name="timer-outline" size={20} color={timeLeft <= 60 ? Colors.error : Colors.warning} />
                    </View>
                    <Text style={[styles.timerText, timeLeft <= 60 && styles.timerCritical]}>
                      Expires in {formatTime(timeLeft)}
                    </Text>
                  </View>

                  {/* Progress Bar */}
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBackground}>
                      <View style={[
                        styles.progressBar,
                        {
                          width: `${(timeLeft / 300) * 100}%`,
                          backgroundColor: timeLeft <= 60 ? Colors.error : timeLeft <= 120 ? Colors.warning : Colors.success,
                        }
                      ]} />
                    </View>
                  </View>

                  {/* Warning for low time */}
                  {timeLeft <= 120 && (
                    <View style={[styles.warningContainer, timeLeft <= 60 && styles.criticalWarning]}>
                      <Ionicons
                        name="warning-outline"
                        size={16}
                        color={timeLeft <= 60 ? Colors.error : Colors.warning}
                      />
                      <Text style={[styles.warningText, timeLeft <= 60 && styles.criticalWarningText]}>
                        {timeLeft <= 60 ? 'PIN expires very soon!' : 'PIN expires soon!'}
                      </Text>
                    </View>
                  )}

                  {/* Action Buttons */}
                  <View style={styles.buttonContainer}>
                    <Button
                      title="Generate New PIN"
                      onPress={() => {
                        reset();
                        generatePin();
                      }}
                      variant="outline"
                      style={styles.actionButton}
                    />
                    <Button
                      title="Done"
                      onPress={handleClose}
                      style={styles.actionButton}
                    />
                  </View>
                </Card>
              </View>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlayBackground,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    maxHeight: '90%',
  },
  header: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: Colors.backgroundSecondary,
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
  },
  closeButton: {
    padding: 6,
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  initialContainer: {
    alignItems: 'center',
  },
  initialCard: {
    width: '100%',
    alignItems: 'center',
    padding: 28,
  },
  shieldContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  shieldGlow: {
    position: 'absolute',
    width: 130,
    height: 130,
    backgroundColor: Colors.primary + '15',
    borderRadius: 65,
  },
  shieldIcon: {
    width: 100,
    height: 100,
    backgroundColor: Colors.primary + '20',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  initialTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 18,
    textAlign: 'center',
  },
  initialSubtitle: {
    fontSize: 18,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 32,
    paddingHorizontal: 8,
    fontWeight: '500',
  },
  securityContainer: {
    width: '100%',
    backgroundColor: Colors.primary + '10',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1.5,
    borderColor: Colors.primary + '30',
  },
  securityHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  securityHeaderText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.overlayBackground,
  },
  securityFeatures: {
    gap: 14,
  },
  securityFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  securityText: {
    fontSize: 16,
    color: Colors.overlayBackground,
    fontWeight: '600',
  },
  generateButton: {
    width: '100%',
    paddingVertical: 16,
  },
  pinContainer: {
    alignItems: 'center',
  },
  pinCard: {
    width: '100%',
    alignItems: 'center',
    padding: 28,
  },
  successContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  successIcon: {
    width: 90,
    height: 90,
    backgroundColor: Colors.success + '20',
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 14,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 18,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  pinDisplay: {
    width: '100%',
    marginBottom: 28,
  },
  pinBackground: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderWidth: 3,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  pinText: {
    fontSize: 48,
    // fontFamily: 'monospace',
    fontWeight: '900',
    color: Colors.overlayBackground,
    textAlign: 'center',
    // letterSpacing: 16,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 14,
  },
  timerIcon: {
    marginRight: 10,
  },
  timerText: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.warning,
  },
  timerCritical: {
    color: Colors.error,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 18,
  },
  progressBackground: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.warning + '15',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 28,
    gap: 10,
    borderWidth: 1.5,
    borderColor: Colors.warning + '40',
  },
  criticalWarning: {
    backgroundColor: Colors.error + '15',
    borderColor: Colors.error + '40',
  },
  warningText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.warning,
  },
  criticalWarningText: {
    color: Colors.error,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 14,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
  },
});