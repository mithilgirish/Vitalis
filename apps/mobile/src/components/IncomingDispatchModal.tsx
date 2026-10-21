import React from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import {
  ShieldAlert,
  MapPin,
  Clock,
  Package,
  Activity,
  AlertTriangle,
} from 'lucide-react-native';
import { SlideToConfirm } from './SlideToConfirm';
import { useMission } from '@/context/MissionContext';
import { VitalisLogo } from './VitalisLogo';

interface IncomingDispatchModalProps {
  visible: boolean;
  onAccept: () => void;
}

export const IncomingDispatchModal: React.FC<IncomingDispatchModalProps> = ({
  visible,
  onAccept,
}) => {
  const { urgencyLabel, cargo, origin, destination, distanceKm, etaSeconds, colors, isDark } =
    useMission();

  const etaMinutes = Math.floor(etaSeconds / 60);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
        style={[
          styles.backdrop,
          { backgroundColor: isDark ? 'rgba(0, 0, 0, 0.75)' : 'rgba(15, 23, 42, 0.65)' },
        ]}>
        <View
          style={[
            styles.modalCard,
            {
              backgroundColor: isDark ? 'rgba(28, 29, 35, 0.96)' : 'rgba(255, 255, 255, 0.98)',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
            },
          ]}>
          {/* Header Siren Bar */}
          <View style={[styles.urgentBanner, { backgroundColor: colors.esiCrimson }]}>
            <ShieldAlert size={16} color="#FFFFFF" strokeWidth={2.4} />
            <Text style={styles.urgentBannerText}>{urgencyLabel}</Text>
          </View>

          {/* Modal Content */}
          <View style={styles.content}>
            <View style={styles.titleRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <VitalisLogo size="md" showText={false} />
                <View>
                  <Text style={[styles.calloutText, { color: colors.textMuted }]}>
                    DISPATCH ASSIGNMENT
                  </Text>
                  <Text style={[styles.mainTitle, { color: colors.textPrimary }]}>
                    Emergency Blood Transfer
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.pulseRadioBadge,
                  {
                    backgroundColor: isDark
                      ? 'rgba(255, 69, 58, 0.16)'
                      : 'rgba(255, 69, 58, 0.10)',
                  },
                ]}>
                <Activity size={12} color={colors.esiCrimson} strokeWidth={2.4} />
                <Text style={[styles.pulseRadioText, { color: colors.esiCrimson }]}>
                  LIVE
                </Text>
              </View>
            </View>

            {/* Cargo Summary Highlight Box */}
            <View
              style={[
                styles.cargoBox,
                {
                  backgroundColor: isDark ? 'rgba(20, 21, 25, 0.65)' : 'rgba(242, 242, 247, 0.75)',
                  borderColor: isDark ? 'rgba(255, 69, 58, 0.28)' : 'rgba(255, 69, 58, 0.20)',
                },
              ]}>
              <View
                style={[
                  styles.cargoIconWrapper,
                  { backgroundColor: colors.esiCrimson },
                ]}>
                <Package size={20} color="#FFFFFF" strokeWidth={2.2} />
              </View>
              <View style={styles.cargoDetails}>
                <Text style={[styles.cargoLabel, { color: colors.esiCrimson }]}>
                  CRITICAL PAYLOAD
                </Text>
                <Text style={[styles.cargoTitle, { color: colors.textPrimary }]}>{cargo}</Text>
                <Text style={[styles.cargoSub, { color: colors.textSecondary }]}>
                  Envelope: 1.0°C – 6.0°C • Anti-Coagulated PRBC
                </Text>
              </View>
            </View>

            {/* Origin & Destination Route Card */}
            <View
              style={[
                styles.routeBox,
                {
                  backgroundColor: isDark ? 'rgba(20, 21, 25, 0.65)' : 'rgba(242, 242, 247, 0.75)',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                },
              ]}>
              {/* Origin */}
              <View style={styles.routeRow}>
                <View style={styles.nodeIndicator}>
                  <View
                    style={[styles.nodeDotOrigin, { backgroundColor: colors.cobaltBlue }]}
                  />
                  <View
                    style={[
                      styles.nodeLine,
                      {
                        backgroundColor: isDark
                          ? 'rgba(255, 255, 255, 0.12)'
                          : 'rgba(0, 0, 0, 0.10)',
                      },
                    ]}
                  />
                </View>
                <View style={styles.nodeTextContainer}>
                  <Text style={[styles.nodeLabel, { color: colors.cobaltBlue }]}>
                    ORIGIN PICKUP
                  </Text>
                  <Text style={[styles.nodeValue, { color: colors.textPrimary }]}>
                    {origin}
                  </Text>
                  <Text style={[styles.nodeAddress, { color: colors.textMuted }]}>
                    144 Mount Road, Kilpauk
                  </Text>
                </View>
              </View>

              {/* Destination */}
              <View style={styles.routeRow}>
                <View style={styles.nodeIndicator}>
                  <View
                    style={[styles.nodeDotDest, { backgroundColor: colors.esiCrimson }]}
                  />
                </View>
                <View style={styles.nodeTextContainer}>
                  <Text style={[styles.nodeLabel, { color: colors.esiCrimson }]}>
                    DESTINATION HANDOFF
                  </Text>
                  <Text style={[styles.nodeValue, { color: colors.textPrimary }]}>
                    {destination}
                  </Text>
                  <Text style={[styles.nodeAddress, { color: colors.textMuted }]}>
                    Emergency Trauma Bay 2, Greams Rd
                  </Text>
                </View>
              </View>
            </View>

            {/* Viability & Distance Telemetry Summary */}
            <View style={styles.metricsRow}>
              <View
                style={[
                  styles.metricCard,
                  {
                    backgroundColor: isDark
                      ? 'rgba(20, 21, 25, 0.65)'
                      : 'rgba(242, 242, 247, 0.75)',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                  },
                ]}>
                <Clock size={14} color={colors.cobaltBlue} strokeWidth={2.4} />
                <Text style={[styles.metricVal, { color: colors.textPrimary }]}>
                  {etaMinutes} MINS
                </Text>
                <Text style={[styles.metricLabel, { color: colors.textMuted }]}>
                  EST. TRANSIT
                </Text>
              </View>

              <View
                style={[
                  styles.metricCard,
                  {
                    backgroundColor: isDark
                      ? 'rgba(20, 21, 25, 0.65)'
                      : 'rgba(242, 242, 247, 0.75)',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                  },
                ]}>
                <MapPin size={14} color={colors.emeraldSafe} strokeWidth={2.4} />
                <Text style={[styles.metricVal, { color: colors.textPrimary }]}>
                  {distanceKm} KM
                </Text>
                <Text style={[styles.metricLabel, { color: colors.textMuted }]}>
                  DISTANCE
                </Text>
              </View>

              <View
                style={[
                  styles.metricCard,
                  {
                    backgroundColor: isDark
                      ? 'rgba(20, 21, 25, 0.65)'
                      : 'rgba(242, 242, 247, 0.75)',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                  },
                ]}>
                <AlertTriangle size={14} color={colors.amberWarning} strokeWidth={2.4} />
                <Text style={[styles.metricVal, { color: colors.amberWarning }]}>
                  45 MINS
                </Text>
                <Text style={[styles.metricLabel, { color: colors.textMuted }]}>
                  VIABILITY
                </Text>
              </View>
            </View>

            {/* SLIDE TO ACCEPT MISSION */}
            <View style={styles.sliderWrapper}>
              <SlideToConfirm
                label="SLIDE TO ACCEPT MISSION"
                confirmedLabel="MISSION ACCEPTED • INITIALIZING GPS"
                onConfirm={onAccept}
                color={colors.esiCrimson}
                height={58}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    borderRadius: 28,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 14,
  },
  urgentBanner: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  urgentBannerText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 0.8,
  },
  content: {
    padding: 16,
    gap: 12,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  calloutText: {
    fontSize: 8.5,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  mainTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
    letterSpacing: 0.2,
  },
  pulseRadioBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 999,
    gap: 4,
  },
  pulseRadioText: {
    fontSize: 8.5,
    fontWeight: '800',
  },
  cargoBox: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cargoIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cargoDetails: {
    flex: 1,
  },
  cargoLabel: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  cargoTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    marginTop: 1,
  },
  cargoSub: {
    fontSize: 9.5,
    marginTop: 1,
  },
  routeBox: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 11,
    gap: 8,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
  },
  nodeIndicator: {
    alignItems: 'center',
    width: 10,
    paddingTop: 3,
  },
  nodeDotOrigin: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  nodeLine: {
    width: 1.5,
    height: 22,
    marginVertical: 2,
  },
  nodeDotDest: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  nodeTextContainer: {
    flex: 1,
  },
  nodeLabel: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  nodeValue: {
    fontSize: 11.5,
    fontWeight: '700',
    marginTop: 1,
  },
  nodeAddress: {
    fontSize: 9,
    marginTop: 1,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  metricCard: {
    flex: 1,
    borderRadius: 13,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 7,
    alignItems: 'center',
    gap: 2.5,
  },
  metricVal: {
    fontFamily: 'monospace',
    fontWeight: '800',
    fontSize: 11,
  },
  metricLabel: {
    fontSize: 7.5,
    fontWeight: '700',
  },
  sliderWrapper: {
    marginTop: 2,
  },
});
