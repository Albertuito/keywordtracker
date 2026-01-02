import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Register a standard font if needed, otherwise use Helvetica (built-in)

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Helvetica',
        backgroundColor: '#ffffff',
        color: '#333333',
    },
    coverPage: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        padding: 20,
    },
    logoText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#4F46E5', // Indigo-600
        marginBottom: 20,
    },
    title: {
        fontSize: 32,
        marginBottom: 10,
        marginTop: 40,
        textAlign: 'center',
        color: '#111827',
    },
    subtitle: {
        fontSize: 18,
        marginBottom: 30,
        textAlign: 'center',
        color: '#6B7280',
    },
    metaBox: {
        marginTop: 20,
        padding: 15,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        width: '80%',
    },
    metaText: {
        fontSize: 12,
        marginBottom: 5,
        textAlign: 'center',
    },

    // Content pages
    header: {
        marginBottom: 20,
        borderBottomWidth: 2,
        borderBottomColor: '#4F46E5',
        paddingBottom: 10,
    },
    headerTitle: {
        fontSize: 10,
        color: '#9CA3AF',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        marginTop: 20,
        color: '#4F46E5',
    },
    subSectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 8,
        marginTop: 15,
        color: '#111827',
    },
    text: {
        fontSize: 11,
        lineHeight: 1.5,
        marginBottom: 8,
        color: '#374151',
    },
    badge: {
        padding: 4,
        backgroundColor: '#EEF2FF',
        borderRadius: 4,
        fontSize: 10,
        color: '#4F46E5',
        marginRight: 5,
    },

    // Tables
    table: {
        display: 'flex',
        width: 'auto',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRightWidth: 0,
        borderBottomWidth: 0,
        marginTop: 10,
    },
    tableRow: {
        margin: 'auto',
        flexDirection: 'row',
    },
    tableColHeader: {
        width: '25%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderLeftWidth: 0,
        borderTopWidth: 0,
        backgroundColor: '#F9FAFB',
        padding: 5,
    },
    tableCol: {
        width: '25%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderLeftWidth: 0,
        borderTopWidth: 0,
        padding: 5,
    },
    tableCellHeader: {
        margin: 5,
        fontSize: 10,
        fontWeight: 'bold',
        color: '#374151',
    },
    tableCell: {
        margin: 5,
        fontSize: 9,
        color: '#6B7280',
    },

    // Priority Box
    priorityBox: {
        padding: 10,
        marginBottom: 8,
        backgroundColor: '#F3F4F6',
        borderRadius: 4,
        borderLeftWidth: 3,
        borderLeftColor: '#4F46E5',
    },

    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        textAlign: 'center',
        fontSize: 8,
        color: '#9CA3AF',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingTop: 10,
    }
});

interface KeywordReportPDFProps {
    seedKeyword: string;
    keywords: any[];
    analysis: any;
    date: string;
    country: string;
}

export const KeywordReportPDF = ({ seedKeyword, keywords, analysis, date, country }: KeywordReportPDFProps) => {
    // Top opportunities logic
    const topKeywords = keywords
        .filter((k: any) => k.volume > 0)
        .sort((a: any, b: any) => b.volume - a.volume)
        .slice(0, 15);

    return (
        <Document>
            {/* Page 1: Cover */}
            <Page size="A4" style={styles.page}>
                <View style={styles.coverPage}>
                    <Text style={styles.logoText}>KeywordTracker.es</Text>

                    <Text style={styles.title}>Informe de Inteligencia Keyword</Text>
                    <Text style={styles.subtitle}>{seedKeyword}</Text>

                    <View style={styles.metaBox}>
                        <Text style={styles.metaText}>Fecha: {date}</Text>
                        <Text style={styles.metaText}>País: {country.toUpperCase()}</Text>
                        <Text style={styles.metaText}>Keywords analizadas: {keywords.length}</Text>
                    </View>
                </View>
                <Text style={styles.footer}>Generado automáticamente por KeywordTracker.es</Text>
            </Page>

            {/* Page 2: Strategic Analysis */}
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Análisis Estratégico - {seedKeyword}</Text>
                </View>

                {analysis && (
                    <>
                        <View>
                            <Text style={styles.sectionTitle}>Resumen Ejecutivo</Text>
                            <Text style={styles.text}>{analysis.summary}</Text>
                        </View>

                        <View>
                            <Text style={styles.sectionTitle}>Top Oportunidades Prioritarias</Text>
                            {analysis.priority_ranking?.map((item: any, i: number) => (
                                <View key={i} style={styles.priorityBox}>
                                    <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 2 }}>{item.keyword}</Text>
                                    <Text style={{ fontSize: 10, color: '#4B5563' }}>{item.reason}</Text>
                                    <Text style={{ fontSize: 9, color: '#4F46E5', marginTop: 4, textTransform: 'uppercase' }}>{item.priority} PRIORITY</Text>
                                </View>
                            ))}
                        </View>

                        <View>
                            <Text style={styles.sectionTitle}>Estructura Recomendada</Text>

                            <Text style={styles.subSectionTitle}>URL / Slug</Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 }}>
                                {analysis.url_keywords?.map((kw: string, i: number) => (
                                    <Text key={i} style={styles.badge}>{kw}</Text>
                                ))}
                            </View>

                            <Text style={styles.subSectionTitle}>Título Principal (H1)</Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 }}>
                                {analysis.title_keywords?.map((kw: string, i: number) => (
                                    <Text key={i} style={styles.badge}>{kw}</Text>
                                ))}
                            </View>

                            <Text style={styles.subSectionTitle}>Subtítulos (H2)</Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 }}>
                                {analysis.h2_keywords?.map((kw: string, i: number) => (
                                    <Text key={i} style={styles.badge}>{kw}</Text>
                                ))}
                            </View>
                        </View>

                        {analysis.content_gaps && analysis.content_gaps.length > 0 && (
                            <View>
                                <Text style={styles.sectionTitle}>Gaps de Contenido</Text>
                                {analysis.content_gaps.map((gap: string, i: number) => (
                                    <Text key={i} style={styles.text}>• {gap}</Text>
                                ))}
                            </View>
                        )}

                        {analysis.faq_questions && analysis.faq_questions.length > 0 && (
                            <View>
                                <Text style={styles.sectionTitle}>Preguntas Frecuentes (FAQ)</Text>
                                {analysis.faq_questions.map((q: string, i: number) => (
                                    <Text key={i} style={styles.text}>? {q}</Text>
                                ))}
                            </View>
                        )}
                    </>
                )}

                <Text style={styles.footer} render={({ pageNumber, totalPages }) => (
                    `${pageNumber} / ${totalPages} - KeywordTracker.es`
                )} fixed />
            </Page>

            {/* Page 3: Keyword Data Table */}
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Datos de Keywords ({keywords.length})</Text>
                </View>

                <View style={styles.table}>
                    <View style={styles.tableRow}>
                        <View style={{ ...styles.tableColHeader, width: '40%' }}>
                            <Text style={styles.tableCellHeader}>Keyword</Text>
                        </View>
                        <View style={{ ...styles.tableColHeader, width: '20%' }}>
                            <Text style={styles.tableCellHeader}>Volumen</Text>
                        </View>
                        <View style={{ ...styles.tableColHeader, width: '20%' }}>
                            <Text style={styles.tableCellHeader}>KD %</Text>
                        </View>
                        <View style={{ ...styles.tableColHeader, width: '20%' }}>
                            <Text style={styles.tableCellHeader}>CPC</Text>
                        </View>
                    </View>

                    {topKeywords.map((kw: any, i: number) => (
                        <View key={i} style={styles.tableRow}>
                            <View style={{ ...styles.tableCol, width: '40%' }}>
                                <Text style={styles.tableCell}>{kw.keyword}</Text>
                            </View>
                            <View style={{ ...styles.tableCol, width: '20%' }}>
                                <Text style={styles.tableCell}>{kw.volume?.toLocaleString()}</Text>
                            </View>
                            <View style={{ ...styles.tableCol, width: '20%' }}>
                                <Text style={styles.tableCell}>{kw.difficulty}</Text>
                            </View>
                            <View style={{ ...styles.tableCol, width: '20%' }}>
                                <Text style={styles.tableCell}>{kw.cpc?.toFixed(2)}€</Text>
                            </View>
                        </View>
                    ))}
                </View>

                <Text style={{ fontSize: 9, color: '#9CA3AF', marginTop: 10, textAlign: 'center' }}>
                    Mostrando top keywords por volumen. Para ver todas, usa la exportación CSV en la plataforma.
                </Text>

                <Text style={styles.footer} render={({ pageNumber, totalPages }) => (
                    `${pageNumber} / ${totalPages} - KeywordTracker.es`
                )} fixed />
            </Page>
        </Document>
    );
};
