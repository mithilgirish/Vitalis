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
import { ERGONOMICS } from '@/theme/vitalis-theme';
import { SlideToConfirm } from './SlideToConfirm';
import { useMission } from '@/context/MissionContext';

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
          { backgroundColor: isDark ? 'rgba(10, 12, 16, 0.88)' : 'rgba(15, 23, 42, 0.65)' },
        ]}>
        <View
          style={[
            styles.modalCard,
            {
              backgroundColor: colors.bgCard,
              borderColor: colors.esiCrimson,
            },
          ]}>
          {/* Header Siren Bar */}
          <View style={[styles.urgentBanner, { backgroundColor: colors.esiCrimson }]}>
            <ShieldAlert size={18} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.urgentBannerText}>{urgencyLabel}</Text>
          </View>

          {/* Modal Header Title */}
          <View style={styles.content}>
            <View style={styles.titleRow}>
              <View>
                <Text style={[styles.calloutText, { color: colors.textMuted }]}>
                  DISPATCH COMMAND ASSIGNMENT
                </Text>
                <Text style={[styles.mainTitle, { color: colors.textPrimary }]}>
                  EMERGENCY BLOOD TRANSFER
                </Text>
              </View>
              <View
                style={[
                  styles.pulseRadioBadge,
                  { backgroundColor: colors.esiCrimsonBg },
                ]}>
                <Activity size={13} color={colors.esiCrimson} />
                <Text style={[styles.pulseRadioText, { color: colors.esiCrimson }]}>
                  LIVE DISPATCH
                </Text>
              </View>
            </View>

            {/* Cargo Summary Highlight Box */}
            <View
              style={[
                styles.cargoBox,
                {
                  backgroundColor: colors.bgCardElevated,
                  borderColor: isDark ? 'rgba(225, 29, 72, 0.35)' : 'rgba(225, 29, 72, 0.25)',
                },
              ]}>
              <View
                style={[
                  styles.cargoIconWrapper,
                  { backgroundColor: colors.esiCrimson },
                ]}>
                <Package size={22} color="#FFFFFF" />
              </View>
              <View style={styles.cargoDetails}>
                <Text style={[styles.cargoLabel, { color: colors.esiCrimson }]}>
                  CRITICAL BIOLOGICAL PAYLOAD
                </Text>
                <Text style={[styles.cargoTitle, { color: colors.textPrimary }]}>{cargo}</Text>
                <Text style={[styles.cargoSub, { color: colors.textSecondary }]}>
                  Cold Envelope: 1.0°C – 6.0°C • Anti-Coagulated PRBC
                </Text>
              </View>
            </View>

            {/* Origin & Destination Route Card */}
            <View
              style={[
                styles.routeBox,
                {
                  backgroundColor: colors.bgCardElevated,
                  borderColor: colors.border,
                },
              ]}>
              {/* Origin */}
              <View style={styles.routeRow}>
                <View style={styles.nodeIndicator}>
                  <View
                    style={[styles.nodeDotOrigin, { backgroundColor: colors.cobaltBlue }]}
                  />
                  <View style={[styles.nodeLine, { backgroundColor: colors.border }]} />
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
                    backgroundColor: colors.bgCardElevated,
                    borderColor: colors.border,
                  },
                ]}>
                <Clock size={15} color={colors.cobaltBlue} />
                <Text style={[styles.metricVal, { color: colors.textPrimary }]}>
                  {etaMinutes} MINS
                </Text>
                <Text style={[styles.metricLabel, { color: colors.textMuted }]}>
                  TRANSIT WINDOW
                </Text>
              </View>

              <View
                style={[
                  styles.metricCard,
                  {
                    backgroundColor: colors.bgCardElevated,
                    borderColor: colors.border,
                  },
                ]}>
                <MapPin size={15} color={colors.emeraldSafe} />
                <Text style={[styles.metricVal, { color: colors.textPrimary }]}>
                  {distanceKm} KM
                </Text>
                <Text style={[styles.metricLabel, { color: colors.textMuted }]}>
                  ROUTE LENGTH
                </Text>
              </View>

              <View
                style={[
                  styles.metricCard,
                  {
                    backgroundColor: colors.bgCardElevated,
                    borderColor: colors.border,
                  },
                ]}>
                <AlertTriangle size={15} color={colors.amberWarning} />
                <Text style={[styles.metricVal, { color: colors.amberWarning }]}>
                  45 MINS
                </Text>
                <Text style={[styles.metricLabel, { color: colors.textMuted }]}>
                  VIABILITY LIMIT
                </Text>
              </View>
            </View>

            {/* SLIDE TO ACCEPT MISSION (56px+ Touch Target) */}
            <View style={styles.sliderWrapper}>
              <SlideToConfirm
                label="SLIDE TO ACCEPT MISSION"
                confirmedLabel="MISSION ACCEPTED • INITIALIZING GPS"
                onConfirm={onAccept}
                color={colors.esiCrimson}
                height={60}
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
    borderRadius: ERGONOMICS.radiusXl,
    borderWidth: 1.5,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  urgentBanner: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  urgentBannerText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 1.2,
  },
  content: {
    padding: 18,
    gap: 14,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  calloutText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  mainTitle: {
    fontSize: 16.5,
    fontWeight: '900',
    marginTop: 2,
    letterSpacing: 0.4,
  },
  pulseRadioBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3.5,
    paddingHorizontal: 8,
    borderRadius: ERGONOMICS.radiusSm,
    gap: 4,
  },
  pulseRadioText: {
    fontSize: 9,
    fontWeight: '800',
  },
  cargoBox: {
    borderRadius: ERGONOMICS.radiusMd,
    borderWidth: 1,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cargoIconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cargoDetails: {
    flex: 1,
  },
  cargoLabel: {
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  cargoTitle: {
    fontSize: 15,
    fontWeight: '900',
    marginTop: 1,
  },
  cargoSub: {
    fontSize: 10,
    marginTop: 1,
  },
  routeBox: {
    borderRadius: ERGONOMICS.radiusMd,
    borderWidth: 1,
    padding: 12,
    gap: 10,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  nodeIndicator: {
    alignItems: 'center',
    width: 12,
    paddingTop: 3,
  },
  nodeDotOrigin: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
  },
  nodeLine: {
    width: 1.5,
    height: 26,
    marginVertical: 3,
  },
  nodeDotDest: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
  },
  nodeTextContainer: {
    flex: 1,
  },
  nodeLabel: {
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  nodeValue: {
    fontSize: 12.5,
    fontWeight: '800',
    marginTop: 1,
  },
  nodeAddress: {
    fontSize: 9.5,
    marginTop: 1,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metricCard: {
    flex: 1,
    borderRadius: ERGONOMICS.radiusSm,
    borderWidth: 1,
    padding: 8,
    alignItems: 'center',
    gap: 3,
  },
  metricVal: {
    fontFamily: 'monospace',
    fontWeight: '900',
    fontSize: 12,
  },
  metricLabel: {
    fontSize: 8,
    fontWeight: '800',
  },
  sliderWrapper: {
    marginTop: 4,
  },
});
