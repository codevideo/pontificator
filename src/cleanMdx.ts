import * as fs from 'fs';

interface Frontmatter {
    title?: string;
    description?: string;
    date?: string;
    tags?: string[];
}

const monthName = (month: number): string => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month - 1];
}

const ordinal = (day: number): string => {
    if (10 <= day % 100 && day % 100 <= 20) {
        return `${day}th`;
    }
    const suffix = {1: 'st', 2: 'nd', 3: 'rd'}[day % 10] || 'th';
    return `${day}${suffix}`;
}

const transformFrontmatter = (frontmatter: string): string => {
    // Extract title
    const titleMatch = frontmatter.match(/title:\s*([^\n\r]+)/);
    const title = titleMatch ? titleMatch[1].trim() : '';

    // Extract description
    const descriptionMatch = frontmatter.match(/description:\s*([^\n\r]+)/);
    let description = descriptionMatch ? descriptionMatch[1].trim() : '';
    
    // if description includes 'date:', that means the description was empty
    if (description.includes('date:')) {
        description = '';
    }

    // Extract date
    const dateMatch = frontmatter.match(/date:\s*"(\d{4}-\d{2}-\d{2})"/);
    const date = dateMatch ? dateMatch[1] : '';

    // Format date
    let formattedDate = '';
    if (date) {
        const [year, month, day] = date.split('-').map(Number);
        formattedDate = `Posted on ${monthName(month)} ${ordinal(day)}, ${year}.`;
    }

    // Extract tags
    const tagsMatch = frontmatter.match(/tags:\s*([\w\s,]+)/i);
    const tags = tagsMatch ? tagsMatch[1].split(',').map(tag => tag.trim()) : [];

    // Format tags
    const formattedTags = tags.length > 0
        ? `Tags include ${tags.slice(0, -1).join(', ')}${tags.length > 1 ? ', and ' : ''}${tags[tags.length - 1]}.`
        : '';

    return `${title}\n\n${description}\n\n${formattedDate}\n\n${formattedTags}`;
}

const removeHtmlBlocks = (text: string): string => {
    return text.replace(/<[^>]+>/g, '');
}

const removeLinks = (text: string): string => {
    let result = text
        .replace(/!\[.*?\]\(.*?\)/g, '') // Remove image links and captions
        .replace(/!\[.*?\]/g, '')
        .replace(/\[.*?\]\(.*?\)/g, '') // Remove regular links
        .replace(/\[\[\d+\]\]\(.*?\)/g, '') // Remove ASME citation links
        .replace(/^[*-]\s+/gm, '') // Remove bullet points
        .replace(/^!.*/gm, '') // Remove lines starting with '!'
        .replace(/!+/g, ''); // Remove remaining exclamation marks
    return result;
}

const removeImports = (text: string): string => {
    return text.replace(/^import .*$/gm, '');
}

const deEmojify = (text: string): string => {
    return text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}]/gu, '');
}

const extractTextFromMarkdownLinks = (text: string): string => {
    return text.replace(/\[([^\[\]]*)\]\([^)]*\)/g, '$1');
}

const removeMarkdownElements = (text: string): string => {
    return text
        .replace(/\*(.*?)\*/g, '$1') // Remove * from bold words
        .replace(/_(.*?)_/g, '$1') // Remove _ from italic words
        .replace(/^#+\s+(.*)/gm, '$1.') // Add period after headings
        .replace(/^#+\s+/gm, ''); // Remove heading markers
}

const removeBadCharacters = (text: string): string => {
    return text
        .replace(/'/g, "'")
        .replace(/"/g, '"')
        .replace(/"/g, '"');
}

export const cleanMdx = (inputFile: string): void => {
    const content = fs.readFileSync(inputFile, 'utf-8');
    
    let filteredContent = content;
    filteredContent = removeHtmlBlocks(filteredContent);
    filteredContent = removeImports(filteredContent);
    filteredContent = filteredContent.replace(/```.*?```/gs, '');
    filteredContent = extractTextFromMarkdownLinks(filteredContent);
    filteredContent = removeMarkdownElements(filteredContent);
    filteredContent = deEmojify(filteredContent);
    
    // Transform frontmatter if present
    const frontmatterMatch = filteredContent.match(/---\n(.*?)\n---/s);
    if (frontmatterMatch) {
        const transformedFrontmatter = transformFrontmatter(frontmatterMatch[1]);
        filteredContent = filteredContent.replace(/---\n(.*?)\n---/s, transformedFrontmatter);
    }
    
    filteredContent = removeLinks(filteredContent);
    filteredContent = removeBadCharacters(filteredContent);
    
    const outputFile = inputFile.replace('.mdx', '.txt');
    fs.writeFileSync(outputFile, filteredContent);
}