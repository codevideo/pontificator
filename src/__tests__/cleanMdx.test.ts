import * as fs from 'fs';
import { cleanMdx } from '../cleanMdx';

jest.mock('fs');

describe('cleanMdx', () => {
    const mockFs = fs as jest.Mocked<typeof fs>;
    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('transforms frontmatter correctly', () => {
        const mockContent = `---
title: Test Title
description: Test Description
date: "2024-01-15"
tags: tag1, tag2, tag3
---
content`;

        mockFs.readFileSync.mockReturnValue(mockContent);
        mockFs.writeFileSync.mockImplementation(() => {});

        cleanMdx('test.mdx');

        expect(mockFs.writeFileSync).toHaveBeenCalledWith(
            'test.txt',
            expect.stringContaining('Test Title')
        );
        expect(mockFs.writeFileSync).toHaveBeenCalledWith(
            'test.txt',
            expect.stringContaining('Posted on January 15th, 2024')
        );
        expect(mockFs.writeFileSync).toHaveBeenCalledWith(
            'test.txt',
            expect.stringContaining('Tags include tag1, tag2, and tag3')
        );
    });

    test('removes HTML blocks', () => {
        const mockContent = 'Text with <div class="test">HTML</div> blocks';
        mockFs.readFileSync.mockReturnValue(mockContent);

        cleanMdx('test.mdx');

        const expectedContent = 'Text with HTML blocks';
        expect(mockFs.writeFileSync).toHaveBeenCalledWith(
            'test.txt',
            expectedContent
        );
    });
});