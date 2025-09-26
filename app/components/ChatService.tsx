'use client';

// Types for chat functionality
export type Role = 'user' | 'bot';
export type Message = { role: Role; content: string };

/**
 * Custom hook for managing chat state and interactions
 */
export function useChatService() {
  // Implementation would go here - moved to the ChatWidget component for now
  // This could be expanded in the future to separate business logic from UI
}

/**
 * Function to clear sensitive data from chat history
 * @param messages Array of chat messages
 * @returns Sanitized messages
 */
export function sanitizeChatHistory(messages: Message[]): Message[] {
  // This is a simple implementation that could be expanded
  // to remove PII, credit card numbers, etc.
  return messages.map(msg => ({
    ...msg,
    content: msg.content
      .replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[CREDIT CARD REDACTED]')
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, '[EMAIL REDACTED]')
      .replace(/\b\d{3}[\s-]?\d{3}[\s-]?\d{4}\b/g, '[PHONE REDACTED]')
  }));
}

/**
 * Format the chatbot's response text
 * @param text Raw text from the API
 * @returns Formatted text
 */
export function formatChatResponse(text?: string): string {
  // Handle undefined or null text
  if (!text) return '';
  
  // Add more formatting as needed
  return text
    .trim()
    .replace(/\n{3,}/g, '\n\n'); // Replace excessive newlines
}

/**
 * Truncate chat history to stay within token limits
 * @param messages Chat history
 * @param maxMessages Maximum number of messages to keep
 * @returns Truncated message history
 */
export function truncateChatHistory(messages: Message[], maxMessages = 10): Message[] {
  if (messages.length <= maxMessages) return messages;
  
  // Always keep the first greeting message if it exists and is from the bot
  const firstMessage = messages[0].role === 'bot' ? [messages[0]] : [];
  
  // Keep the most recent messages up to maxMessages-1 (if we kept the first message)
  const recentMessages = messages.slice(-(maxMessages - (firstMessage.length > 0 ? 1 : 0)));
  
  return [...firstMessage, ...recentMessages];
}