import type { McduPage, McduLine, McduToken, McduColor, McduFont, DisplayData, DisplaySegment } from '../types/fmc';
import type { DisplayColor } from './displayColors';
import { seg } from './displayGrid';
import { PAGE_LINES, PAGE_WIDTH } from './constants';

/**
 * Validates a page structure against the 14x24 rule.
 */
export function validateMcduPage(page: McduPage) {
  if (page.lines.length !== PAGE_LINES) {
    throw new Error(`MCDU page must have exactly ${PAGE_LINES} lines, got ${page.lines.length}`);
  }

  for (let i = 0; i < page.lines.length; i++) {
    const line = page.lines[i];
    const totalLength = calculateLineLength(line);
    if (totalLength > PAGE_WIDTH) {
      throw new Error(`Line ${i + 1} too long: ${totalLength} characters (max ${PAGE_WIDTH})`);
    }
  }
}

function calculateLineLength(line: McduLine): number {
  let length = 0;
  if (line.left) length += line.left.reduce((sum, t) => sum + t.text.length, 0);
  if (line.center) length += line.center.reduce((sum, t) => sum + t.text.length, 0);
  if (line.right) length += line.right.reduce((sum, t) => sum + t.text.length, 0);
  return length;
}

/**
 * Renders an Airbus MCDU page applying semantic color rules.
 */
export function renderAirbusMcduPage(page: McduPage, lskActions: Record<string, string | null> = {}): DisplayData {
  validateMcduPage(page);

  const segments: DisplaySegment[] = [];

  page.lines.forEach((line, rowIndex) => {
    // Left aligned tokens
    let leftOffset = 0;
    line.left?.forEach((token) => {
      segments.push(
        seg(rowIndex, leftOffset, token.text, token.color as DisplayColor, {
          size: token.font === 'small' ? 'small' : 'normal',
        }),
      );
      leftOffset += token.text.length;
    });

    // Right aligned tokens
    let rightOffset = PAGE_WIDTH;
    line.right?.reverse().forEach((token) => {
      rightOffset -= token.text.length;
      segments.push(
        seg(rowIndex, rightOffset, token.text, token.color as DisplayColor, {
          size: token.font === 'small' ? 'small' : 'normal',
        }),
      );
    });

    // Center aligned tokens (simplistic implementation: centered in available space or overall)
    if (line.center) {
      const centerText = line.center.map((t) => t.text).join('');
      const centerOffset = Math.floor((PAGE_WIDTH - centerText.length) / 2);
      let currentOffset = centerOffset;
      line.center.forEach((token) => {
        segments.push(
          seg(rowIndex, currentOffset, token.text, token.color as DisplayColor, {
            size: token.font === 'small' ? 'small' : 'normal',
          }),
        );
        currentOffset += token.text.length;
      });
    }
  });

  return {
    lines: [], // Using segments instead
    title: page.title,
    segments,
    lskActions,
  };
}

/**
 * Renders a Boeing CDU page applying Boeing semantic rules.
 */
export function renderBoeingCduPage(page: McduPage, lskActions: Record<string, string | null> = {}): DisplayData {
  // Boeing rendering is similar but might have different semantic interpretations if needed in the future.
  // For now, it shares the same base logic.
  return renderAirbusMcduPage(page, lskActions);
}

/**
 * Helper to create a token easily
 */
export function token(text: string, color: McduColor = 'white', font: McduFont = 'large'): McduToken {
  return { text, color, font };
}
