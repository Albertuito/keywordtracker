import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Svg, Path, Rect, Circle } from '@react-pdf/renderer';

// Define styling constants
const colors = {
    primary: '#4F46E5', // Indigo 600
    primaryLight: '#EEF2FF', // Indigo 50
    secondary: '#111827', // Gray 900
    text: '#374151', // Gray 700
    textLight: '#6B7280', // Gray 500
    border: '#E5E7EB', // Gray 200
    success: '#10B981',
    warning: '#F59E0B',
};

const styles = StyleSheet.create({
    page: {
        fontFamily: 'Helvetica',
        backgroundColor: '#FFFFFF',
        paddingBottom: 40,
    },
    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 30,
        backgroundColor: colors.secondary,
        color: '#FFFFFF',
    },
    headerLogo: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    headerDate: {
        fontSize: 10,
        color: '#9CA3AF',
    },
    // Cover Page
    coverContainer: {
        padding: 40,
        flex: 1,
        justifyContent: 'center',
    },
    coverTitle: {
        fontSize: 36,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 10,
    },
    coverSubtitle: {
        fontSize: 20,
        color: colors.text,
        marginBottom: 40,
    },
    metricGrid: {
        flexDirection: 'row',
        gap: 20,
        marginTop: 40,
    },
    metricCard: {
        flex: 1,
        padding: 12,
        backgroundColor: colors.primaryLight,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    metricValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.primary,
        textAlign: 'center',
    },
    metricLabel: {
        fontSize: 8,
        color: colors.textLight,
        textTransform: 'uppercase',
        marginTop: 5,
        textAlign: 'center',
    },
    // Sections
    section: {
        paddingHorizontal: 30,
        paddingVertical: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.secondary,
        marginBottom: 15,
        borderBottomWidth: 2,
        borderBottomColor: colors.primary,
        paddingBottom: 5,
    },
    subTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.text,
        marginTop: 10,
        marginBottom: 5,
    },
    paragraph: {
        fontSize: 10,
        lineHeight: 1.6,
        color: colors.text,
        marginBottom: 10,
    },
    // Boxes
    highlightBox: {
        padding: 15,
        backgroundColor: '#F3F4F6',
        borderRadius: 6,
        marginBottom: 15,
        borderLeftWidth: 4,
        borderLeftColor: colors.primary,
    },
    codeBox: {
        padding: 10,
        backgroundColor: '#1F2937',
        borderRadius: 4,
        marginTop: 5,
        marginBottom: 10,
    },
    codeText: {
        fontFamily: 'Courier',
        fontSize: 9,
        color: '#E5E7EB',
    },
    // Charts (Simulated)
    chartBarContainer: {
        marginTop: 5,
        marginBottom: 10,
    },
    chartLabel: {
        fontSize: 9,
        marginBottom: 2,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    barBackground: {
        height: 6,
        backgroundColor: '#E5E7EB',
        borderRadius: 3,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        backgroundColor: colors.primary,
    },
    // Tables
    table: {
        width: '100%',
        marginTop: 10,
        borderWidth: 1,
        borderColor: colors.border,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        minHeight: 25,
        alignItems: 'center',
    },
    tableHeader: {
        backgroundColor: '#F9FAFB',
    },
    tableCell: {
        padding: 5,
        fontSize: 9,
        color: colors.text,
    },
    tableHeaderCell: {
        fontSize: 9,
        fontWeight: 'bold',
        color: colors.secondary,
    },
    // Footer
    footer: {
        position: 'absolute',
        bottom: 20,
        left: 30,
        right: 30,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    pageNumber: {
        fontSize: 8,
        color: colors.textLight,
    },
});

interface KeywordReportPDFProps {
    seedKeyword: string;
    keywords: any[];
    analysis: any;
    date: string;
    country: string;
}

export const KeywordReportPDF = ({ seedKeyword, keywords, analysis, date, country }: KeywordReportPDFProps) => {
    // Metrics
    const totalVolume = keywords.reduce((sum, k) => sum + (k.volume || 0), 0);

    // Filter valid difficulty (> 0) for average to avoid skewing with unknowns
    const validDifficultyKeywords = keywords.filter(k => (k.difficulty || 0) > 0);
    const avgDifficulty = validDifficultyKeywords.length > 0
        ? Math.round(validDifficultyKeywords.reduce((sum, k) => sum + k.difficulty, 0) / validDifficultyKeywords.length)
        : 0;

    // Count Commercial + Transactional as "Transactional" intent group
    const transactionalCount = keywords.filter(k => {
        const intent = (k.intent || '').toLowerCase();
        return intent.includes('transactional') || intent.includes('commercial');
    }).length;

    // Sort top keywords
    const topKeywords = [...keywords].sort((a, b) => b.volume - a.volume).slice(0, 20);

    return (
        <Document>
            {/* PAGE 1: COVER */}
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.headerLogo}>RANKTRACKER</Text>
                    <Text style={styles.headerDate}>{date} • {country}</Text>
                </View>

                <View style={styles.coverContainer}>
                    <Text style={{ fontSize: 12, color: colors.textLight, textTransform: 'uppercase', marginBottom: 5 }}>Informe de Estrategia SEO</Text>
                    <Text style={styles.coverTitle}>{seedKeyword}</Text>
                    <Text style={styles.paragraph}>
                        Análisis completo de oportunidades semánticas y estrategia de posicionamiento.
                    </Text>

                    <View style={styles.metricGrid}>
                        <View style={styles.metricCard}>
                            <Text style={styles.metricValue}>{keywords.length}</Text>
                            <Text style={styles.metricLabel}>Keywords</Text>
                        </View>
                        <View style={styles.metricCard}>
                            <Text style={styles.metricValue}>{totalVolume.toLocaleString()}</Text>
                            <Text style={styles.metricLabel}>Volumen Total</Text>
                        </View>
                        <View style={styles.metricCard}>
                            {/* Color coded difficulty */}
                            <Text style={{ ...styles.metricValue, color: avgDifficulty > 60 ? '#EF4444' : avgDifficulty > 30 ? '#F59E0B' : '#10B981' }}>
                                {avgDifficulty}
                            </Text>
                            <Text style={styles.metricLabel}>KD Promedio</Text>
                        </View>
                        <View style={styles.metricCard}>
                            <Text style={styles.metricValue}>{transactionalCount}</Text>
                            <Text style={styles.metricLabel}>Transaccionales</Text>
                        </View>
                    </View>

                    {/* Difficulty Distribution Chart (Simulated) */}
                    <View style={{ marginTop: 40 }}>
                        <Text style={{ ...styles.subTitle, marginBottom: 15 }}>Distribución de Dificultad</Text>
                        <View style={{ flexDirection: 'row', height: 10, borderRadius: 5, overflow: 'hidden' }}>
                            <View style={{ flex: keywords.filter(k => k.difficulty < 30).length, backgroundColor: '#10B981' }} />
                            <View style={{ flex: keywords.filter(k => k.difficulty >= 30 && k.difficulty < 60).length, backgroundColor: '#F59E0B' }} />
                            <View style={{ flex: keywords.filter(k => k.difficulty >= 60).length, backgroundColor: '#EF4444' }} />
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }}>
                            <Text style={{ fontSize: 8, color: '#10B981' }}>Fácil ({Math.round(keywords.filter(k => k.difficulty < 30).length / keywords.length * 100)}%)</Text>
                            <Text style={{ fontSize: 8, color: '#F59E0B' }}>Media</Text>
                            <Text style={{ fontSize: 8, color: '#EF4444' }}>Difícil</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.pageNumber}>Page 1</Text>
                    <Text style={styles.pageNumber}>Generado con AI Keyword Intelligence</Text>
                </View>
            </Page>

            {/* PAGE 2: STRATEGY */}
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.headerLogo}>{seedKeyword}</Text>
                    <Text style={styles.headerDate}>Estrategia</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Diagnóstico & Estrategia</Text>

                    {analysis?.summary && (
                        <View style={styles.highlightBox}>
                            <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.primary, marginBottom: 5 }}>Resumen Ejecutivo</Text>
                            <Text style={styles.paragraph}>{analysis.summary}</Text>
                        </View>
                    )}

                    {analysis?.page_type_detection && (
                        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
                            <View style={{ flex: 1, padding: 10, borderWidth: 1, borderColor: colors.border, borderRadius: 4 }}>
                                <Text style={{ fontSize: 9, color: colors.textLight }}>Tipo de Página</Text>
                                <Text style={{ fontSize: 12, fontWeight: 'bold', color: colors.secondary }}>
                                    {analysis.page_type_detection.detected_type || 'N/A'}
                                </Text>
                            </View>
                            <View style={{ flex: 1, padding: 10, borderWidth: 1, borderColor: colors.border, borderRadius: 4 }}>
                                <Text style={{ fontSize: 9, color: colors.textLight }}>Intención Dominante</Text>
                                <Text style={{ fontSize: 12, fontWeight: 'bold', color: colors.secondary }}>
                                    {analysis.page_type_detection.dominant_intent || 'N/A'}
                                </Text>
                            </View>
                        </View>
                    )}

                    <Text style={styles.sectionTitle}>Optimización On-Page</Text>

                    {analysis?.optimized_recommendations && (
                        <>
                            <View style={{ marginBottom: 15 }}>
                                <Text style={styles.subTitle}>Title Tag Optimizado</Text>
                                <View style={styles.codeBox}>
                                    <Text style={styles.codeText}>{analysis.optimized_recommendations.title_adjustment || '-'}</Text>
                                </View>
                            </View>

                            <View style={{ marginBottom: 15 }}>
                                <Text style={styles.subTitle}>H1 Recomendado</Text>
                                <View style={styles.codeBox}>
                                    <Text style={styles.codeText}>{analysis.optimized_recommendations.h1_adjustment || '-'}</Text>
                                </View>
                            </View>

                            <View style={{ marginBottom: 15 }}>
                                <Text style={styles.subTitle}>Meta Description</Text>
                                <View style={styles.codeBox}>
                                    <Text style={styles.codeText}>{analysis.optimized_recommendations.meta_description || '-'}</Text>
                                </View>
                            </View>
                        </>
                    )}
                </View>

                <View style={styles.footer}>
                    <Text style={styles.pageNumber}>Page 2</Text>
                </View>
            </Page>

            {/* PAGE 3: KEYWORD TACTICS */}
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.headerLogo}>{seedKeyword}</Text>
                    <Text style={styles.headerDate}>Tácticas</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Oportunidades Secundarias</Text>
                    <Text style={{ ...styles.paragraph, marginBottom: 15 }}>
                        Keywords long-tail de alta relevancia para enriquecer el contenido semántico.
                    </Text>

                    {analysis?.keyword_usage_strategy?.supporting_keywords && (
                        <View>
                            {analysis.keyword_usage_strategy.supporting_keywords.map((item: any, i: number) => {
                                const isObj = typeof item !== 'string';
                                const kw = isObj ? item.keyword : item;
                                const rationale = isObj ? item.rationale : null;
                                const strategy = isObj ? item.strategy : null;

                                return (
                                    <View key={i} style={{ marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}>
                                        <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.primary, marginBottom: 4 }}>{kw}</Text>
                                        {rationale && (
                                            <Text style={{ fontSize: 9, color: colors.text, marginBottom: 2 }}>
                                                <Text style={{ fontWeight: 'bold' }}>Por qué: </Text>{rationale}
                                            </Text>
                                        )}
                                        {strategy && (
                                            <Text style={{ fontSize: 9, color: colors.text }}>
                                                <Text style={{ fontWeight: 'bold' }}>Acción: </Text>{strategy}
                                            </Text>
                                        )}
                                    </View>
                                );
                            })}
                        </View>
                    )}

                    <Text style={{ ...styles.sectionTitle, marginTop: 20 }}>Quick Wins</Text>
                    {analysis?.quick_wins && analysis.quick_wins.map((win: string, i: number) => (
                        <View key={i} style={{ flexDirection: 'row', marginBottom: 8 }}>
                            <Text style={{ fontSize: 10, color: colors.success, marginRight: 8 }}>✓</Text>
                            <Text style={styles.paragraph}>{win}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.footer}>
                    <Text style={styles.pageNumber}>Page 3</Text>
                </View>
            </Page>

            {/* PAGE 4: DATA APPENDIX */}
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.headerLogo}>{seedKeyword}</Text>
                    <Text style={styles.headerDate}>Datos</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Top 20 Keywords</Text>

                    <View style={styles.table}>
                        <View style={{ ...styles.tableRow, ...styles.tableHeader }}>
                            <View style={{ width: '40%' }}><Text style={{ ...styles.tableCell, ...styles.tableHeaderCell, paddingLeft: 10 }}>Keyword</Text></View>
                            <View style={{ width: '20%' }}><Text style={{ ...styles.tableCell, ...styles.tableHeaderCell, textAlign: 'right' }}>Volumen</Text></View>
                            <View style={{ width: '20%' }}><Text style={{ ...styles.tableCell, ...styles.tableHeaderCell, textAlign: 'center' }}>KD %</Text></View>
                            <View style={{ width: '20%' }}><Text style={{ ...styles.tableCell, ...styles.tableHeaderCell, textAlign: 'right', paddingRight: 10 }}>CPC</Text></View>
                        </View>

                        {topKeywords.map((kw, i) => (
                            <View key={i} style={{ ...styles.tableRow, backgroundColor: i % 2 === 0 ? '#FFFFFF' : '#F9FAFB' }}>
                                <View style={{ width: '40%' }}>
                                    <Text style={{ ...styles.tableCell, paddingLeft: 10, color: colors.secondary }}>{kw.keyword}</Text>
                                </View>
                                <View style={{ width: '20%' }}>
                                    <Text style={{ ...styles.tableCell, textAlign: 'right' }}>{kw.volume?.toLocaleString()}</Text>
                                </View>
                                <View style={{ width: '20%' }}>
                                    <View style={{
                                        backgroundColor: kw.difficulty < 30 ? '#D1FAE5' : kw.difficulty < 60 ? '#FEF3C7' : '#FEE2E2',
                                        paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, alignSelf: 'center'
                                    }}>
                                        <Text style={{
                                            fontSize: 8, fontWeight: 'bold',
                                            color: kw.difficulty < 30 ? '#065F46' : kw.difficulty < 60 ? '#92400E' : '#991B1B'
                                        }}>{kw.difficulty}</Text>
                                    </View>
                                </View>
                                <View style={{ width: '20%' }}>
                                    <Text style={{ ...styles.tableCell, textAlign: 'right', paddingRight: 10 }}>{kw.cpc ? `€${kw.cpc.toFixed(2)}` : '-'}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.pageNumber}>Page 4</Text>
                </View>
            </Page>
        </Document>
    );
};
