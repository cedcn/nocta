import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Share } from 'react-native';
import quotesData from '../data/quotes.json';
import { Quote } from '../types';

export default function QuotesScreen() {
  const [dailyQuote, setDailyQuote] = useState<Quote | null>(null);
  const quotes = (quotesData as any).quotes as Quote[];

  useEffect(() => {
    const today = new Date().toDateString();
    const dayIndex = new Date().getDate() % quotes.length;
    setDailyQuote(quotes[dayIndex]);
  }, []);

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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Daily Quote</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.quoteCard}>
          <Text style={styles.quoteText}>"{dailyQuote.text}"</Text>
          <Text style={styles.quoteAuthor}>— {dailyQuote.author}</Text>
          {dailyQuote.from && <Text style={styles.quoteFrom}>{dailyQuote.from}</Text>}
          <TouchableOpacity style={styles.shareButton} onPress={shareQuote}>
            <Text style={styles.shareButtonText}>📤 Share</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.allQuotes}>
          <Text style={styles.sectionTitle}>All Quotes</Text>
          {quotes.map(quote => (
            <View key={quote.id} style={styles.quoteItem}>
              <Text style={styles.quoteItemText}>"{quote.text}"</Text>
              <Text style={styles.quoteItemAuthor}>— {quote.author}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0e27' },
  header: { padding: 20, paddingTop: 60 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  scroll: { flex: 1 },
  content: { padding: 20 },
  quoteCard: { backgroundColor: '#1a2332', borderRadius: 16, padding: 24, marginBottom: 30 },
  quoteText: { fontSize: 18, color: '#fff', lineHeight: 28, marginBottom: 16 },
  quoteAuthor: { fontSize: 16, color: '#6b7fa8', fontStyle: 'italic' },
  quoteFrom: { fontSize: 14, color: '#3b4a6b', marginTop: 4 },
  shareButton: { backgroundColor: '#3b5998', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, marginTop: 20, alignItems: 'center' },
  shareButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  allQuotes: { marginTop: 20 },
  sectionTitle: { fontSize: 20, color: '#fff', fontWeight: '600', marginBottom: 16 },
  quoteItem: { backgroundColor: '#1a2332', borderRadius: 12, padding: 16, marginBottom: 12 },
  quoteItemText: { fontSize: 14, color: '#fff', lineHeight: 22, marginBottom: 8 },
  quoteItemAuthor: { fontSize: 12, color: '#6b7fa8', fontStyle: 'italic' },
});
