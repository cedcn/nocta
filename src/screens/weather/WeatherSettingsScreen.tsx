import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Linking,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ArrowLeft, Check, ExternalLink } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useWeather } from '../../context/WeatherContext';
import { RootScreenProps } from '../../navigation';
import { validateQWeather } from '../../services/weather/qweather';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import { colors, radii, fontSize, shadow } from '../../theme';

const QWEATHER_CONSOLE_URL = 'https://console.qweather.com/';

type SourceChoice = 'default' | 'qweather';
type TestResult = { ok: true } | { ok: false; reason: string } | null;

export default function WeatherSettingsScreen({ navigation }: RootScreenProps<'WeatherSettings'>) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation('weather');
  const { qweather, saveQWeather, clearQWeather } = useWeather();
  const [choice, setChoice] = useState<SourceChoice>(qweather ? 'qweather' : 'default');
  const [host, setHost] = useState(qweather?.host ?? '');
  const [key, setKey] = useState(qweather?.key ?? '');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<TestResult>(null);

  useEffect(() => {
    if (qweather) {
      setChoice('qweather');
      setHost(qweather.host);
      setKey(qweather.key);
    }
  }, [qweather]);

  const inputMissing = !host.trim() || !key.trim();

  const run = async (action: () => Promise<void>) => {
    if (inputMissing) {
      setResult({ ok: false, reason: t('invalid_input') });
      return;
    }
    setBusy(true);
    setResult(null);
    try {
      await action();
      setResult({ ok: true });
    } catch (e) {
      setResult({ ok: false, reason: e instanceof Error ? e.message : String(e) });
    } finally {
      setBusy(false);
    }
  };

  const onTest = () => run(() => validateQWeather({ host, key }));
  const onSave = () => run(() => saveQWeather({ host, key }));

  const onClear = async () => {
    await clearQWeather();
    setHost('');
    setKey('');
    setResult(null);
    setChoice('default');
    Alert.alert(t('source_cleared'));
  };

  const selectDefault = () => {
    if (qweather) onClear();
    else setChoice('default');
  };

  const renderOption = (value: SourceChoice, label: string, onPress: () => void) => (
    <TouchableOpacity style={styles.option} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.optionText}>{label}</Text>
      {choice === value && <Check size={20} color={colors.accent} />}
    </TouchableOpacity>
  );

  return (
    <ScreenBackground>
      <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.circleBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <ArrowLeft size={22} color={colors.textOnAccent} />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {t('source_label')}
        </Text>
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        >
          <GlassCard style={styles.group}>
            {renderOption('default', t('source_default'), selectDefault)}
            <View style={styles.divider} />
            {renderOption('qweather', t('qweather'), () => setChoice('qweather'))}
          </GlassCard>

          {choice === 'qweather' && (
            <>
              <Text style={styles.sectionTitle}>{t('source_title')}</Text>
              <GlassCard style={styles.form}>
                <Text style={styles.desc}>{t('source_desc')}</Text>

                <Text style={styles.label}>{t('source_host')}</Text>
                <TextInput
                  style={styles.input}
                  value={host}
                  onChangeText={setHost}
                  placeholder={t('source_host_hint')}
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                />

                <Text style={styles.label}>{t('source_key')}</Text>
                <TextInput
                  style={styles.input}
                  value={key}
                  onChangeText={setKey}
                  placeholder={t('source_key_hint')}
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="none"
                  autoCorrect={false}
                  secureTextEntry
                />

                {result && (
                  <Text style={[styles.result, result.ok ? styles.resultOk : styles.resultFail]}>
                    {result.ok ? t('source_test_ok') : t('source_test_fail', { p1: result.reason })}
                  </Text>
                )}

                <View style={styles.actions}>
                  {qweather && (
                    <TouchableOpacity style={styles.secondaryBtn} onPress={onClear} disabled={busy}>
                      <Text style={styles.dangerText}>{t('source_clear')}</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={styles.secondaryBtn} onPress={onTest} disabled={busy}>
                    <Text style={styles.secondaryText}>{t('source_test')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.primaryBtn} onPress={onSave} disabled={busy}>
                    {busy ? (
                      <ActivityIndicator size="small" color={colors.textOnAccent} />
                    ) : (
                      <Text style={styles.primaryText}>{t('source_save')}</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </GlassCard>

              <Text style={styles.sectionTitle}>{t('source_tutorial')}</Text>
              <GlassCard style={styles.form}>
                <Text style={styles.steps}>{t('source_tutorial_steps')}</Text>
                <TouchableOpacity
                  style={styles.link}
                  onPress={() => Linking.openURL(QWEATHER_CONSOLE_URL).catch(() => {})}
                  activeOpacity={0.7}
                >
                  <Text style={styles.linkText}>{t('source_apply_link')}</Text>
                  <ExternalLink size={16} color={colors.accent} />
                </TouchableOpacity>
              </GlassCard>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingBottom: 8 },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
  title: { flex: 1, color: colors.textPrimary, fontSize: fontSize.title, fontWeight: '800' },
  content: { paddingHorizontal: 20, paddingTop: 16 },
  group: { padding: 4 },
  option: {
    paddingHorizontal: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionText: { color: colors.textPrimary, fontSize: fontSize.subtitle, fontWeight: '600' },
  divider: { height: 1, backgroundColor: colors.trackInactive, marginHorizontal: 14 },
  sectionTitle: {
    fontSize: fontSize.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 24,
    letterSpacing: 0.5,
  },
  form: { padding: 16 },
  desc: { color: colors.textSecondary, fontSize: fontSize.body, lineHeight: 20 },
  label: { color: colors.textPrimary, fontSize: fontSize.body, fontWeight: '700', marginTop: 16, marginBottom: 8 },
  input: {
    backgroundColor: colors.glassStrong,
    borderRadius: radii.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: fontSize.body,
    color: colors.textPrimary,
  },
  result: { marginTop: 14, fontSize: fontSize.body, fontWeight: '600' },
  resultOk: { color: colors.accent },
  resultFail: { color: colors.danger },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 10, marginTop: 18 },
  secondaryBtn: { paddingHorizontal: 14, paddingVertical: 10 },
  secondaryText: { color: colors.accent, fontSize: fontSize.body, fontWeight: '700' },
  dangerText: { color: colors.danger, fontSize: fontSize.body, fontWeight: '700' },
  primaryBtn: {
    minWidth: 84,
    alignItems: 'center',
    backgroundColor: colors.accent,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: radii.pill,
  },
  primaryText: { color: colors.textOnAccent, fontSize: fontSize.body, fontWeight: '700' },
  steps: { color: colors.textPrimary, fontSize: fontSize.body, lineHeight: 22 },
  link: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14 },
  linkText: { color: colors.accent, fontSize: fontSize.body, fontWeight: '700' },
});
