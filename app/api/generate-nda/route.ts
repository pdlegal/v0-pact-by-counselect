import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';

const TEMPLATE_URL = 'https://raw.githubusercontent.com/pdlegal/v0-pact-by-counselect/refs/heads/main/templates/TECHNIA_MNDA_Template_with_placeholders.docx';

function mergeRuns(xml: string): string {
  return xml.replace(/<w:p[ >][\s\S]*?<\/w:p>/g, (paragraph) => {
    const texts: string[] = [];
    const textRegex = /<w:t[^>]*>([\s\S]*?)<\/w:t>/g;
    let match;
    while ((match = textRegex.exec(paragraph)) !== null) {
      texts.push(match[1]);
    }
    const fullText = texts.join('');
    const hasPlaceholder = fullText.includes('{{');
    if (!hasPlaceholder) return paragraph;

    const pPrMatch = paragraph.match(/<w:pPr>[\s\S]*?<\/w:pPr>/);
    const pPr = pPrMatch ? pPrMatch[0] : '';
    const pOpenMatch = paragraph.match(/^<w:p[^>]*>/);
    const pOpen = pOpenMatch ? pOpenMatch[0] : '<w:p>';

    const escaped = fullText
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    const xmlSpace = fullText !== fullText.trim() ? ' xml:space="preserve"' : '';

    return `${pOpen}${pPr}<w:r><w:t${xmlSpace}>${escaped}</w:t></w:r></w:p>`;
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const replacements: Record<string, string> = {
      '{{COUNTERPARTY_NAME}}': body.counterparty_name || '',
      '{{COUNTERPARTY_ADDRESS}}': body.counterparty_address || '',
      '{{EFFECTIVE_DATE}}': body.effective_date || '',
      '{{PURPOSE}}': body.engagement_type || '',
      '{{TECHNIA_ENTITY_NAME}}': body.technia_entity || '',
      '{{TECHNIA_ENTITY_COUNTRY}}': body.country || '',
      '{{TECHNIA_ENTITY_ADDRESS}}': body.technia_entity_address || '',
    };

    const templateRes = await fetch(TEMPLATE_URL);
    if (!templateRes.ok) throw new Error('Failed to fetch template');
    const templateBuffer = await templateRes.arrayBuffer();

    const zip = await JSZip.loadAsync(templateBuffer);
    let xml = await zip.file('word/document.xml')!.async('string');

    xml = mergeRuns(xml);

    for (const [key, value] of Object.entries(replacements)) {
      xml = xml.split(key).join(value);
    }

    zip.file('word/document.xml', xml);
    const docxBase64 = await zip.generateAsync({ type: 'base64' });

    return NextResponse.json({ success: true, data: docxBase64 });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
