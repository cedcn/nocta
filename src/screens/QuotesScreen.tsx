import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Share } from 'react-native';
import { Sparkles, Share2 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import quotesData from '../data/quotes.json';
import { Quote } from '../types';
import ScreenBackground from '../components/ScreenBackground';
import GlassCard from '../components/GlassCard';
import { colors, radii, fontSize, shadow } from '../theme';

export default function QuotesScreen() {
  const [dailyQuote, setDailyQuote] = useState<Quote | null>(null);
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const quotes = (quotesData as { quotes: Quote[] }).quotes;

  useEffect(() => {
    const dayIndex = new Date().getDate() % quotes.length;
    setDailyQuote(quotes[dayIndex]);
  }, [quotes]);

  const shareQuote = async () => {
    if (!dailyQuote) return;
    try {
      await Share.share({
        message: `"${dailyQuote.text}"\n\n— ${dailyQuote.author}${dailyQuote.from ? ` (${dailyQuote.from})` : ''}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  if (!dailyQuote) return null;

  return (
    <ScreenBackground>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.title}>{t('quotes.title')}</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 110 }]}
      >
        <LinearGradient colors={[colors.accent, colors.accentDark]} style={styles.featuredCard}>
          <Sparkles size={24} color={colors.textOnAccent} style={styles.quoteMark} />
          <Text style={styles.quoteText}>"{dailyQuote.text}"</Text>
          <Text style={styles.quoteAuthor}>— {dailyQuote.author}</Text>
          {dailyQuote.from && <Text style={styles.quoteFrom}>{dailyQuote.from}</Text>}
          <TouchableOpacity style={styles.shareButton} onPress={shareQuote} activeOpacity={0.85}>
            <Share2 size={18} color={colors.accent} />
            <Text style={styles.shareButtonText}>{t('quotes.share')}</Text>
          </TouchableOpacity>
        </LinearGradient>

        <Text style={styles.sectionTitle}>{t('quotes.all')}</Text>
        {quotes.map((quote) => (
          <GlassCard key={quote.id} style={styles.quoteItem}>
            <Text style={styles.quoteItemText}>"{quote.text}"</Text>
            <Text style={styles.quoteItemAuthor}>— {quote.author}</Text>
          </GlassCard>
        ))}
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 8 },
  title: { fontSize: fontSize.display, fontWeight: '800', color: colors.textPrimary },
  content: { padding: 20 },
  featuredCard: { borderRadius: radii.lg, padding: 24, marginBottom: 28, ...shadow },
  quoteMark: { marginBottom: 12 },
  quoteText: { fontSize: fontSize.subtitle + 2, color: colors.textOnAccent, lineHeight: 28, marginBottom: 16 },
  quoteAuthor: { fontSize: fontSize.subtitle, color: colors.textOnAccent, fontWeight: '600', fontStyle: 'italic' },
  quoteFrom: { fontSize: fontSize.body, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.glassStrong,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: radii.pill,
    marginTop: 20,
  },
  shareButtonText: { color: colors.accent, fontSize: fontSize.subtitle, fontWeight: '700' },
  sectionTitle: { fontSize: fontSize.title, color: colors.textPrimary, fontWeight: '700', marginBottom: 16 },
  quoteItem: { marginBottom: 12 },
  quoteItemText: { fontSize: fontSize.body, color: colors.textPrimary, lineHeight: 22, marginBottom: 8 },
  quoteItemAuthor: { fontSize: fontSize.caption, color: colors.textSecondary, fontStyle: 'italic' },
});
