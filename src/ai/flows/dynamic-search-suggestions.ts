'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing dynamic search suggestions as the user types in the search bar.
 *
 * @module DynamicSearchSuggestions
 * @typedef {Object} SearchSuggestionsInput
 * @property {string} searchText - The text currently entered in the search bar.
 * @typedef {Object} SearchSuggestionsOutput
 * @property {string[]} suggestions - An array of search suggestions based on the input text.
 * @function getSearchSuggestions - A function that calls the dynamicSearchSuggestionsFlow with the input and returns the output.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SearchSuggestionsInputSchema = z.object({
  searchText: z.string().describe('The text currently entered in the search bar.'),
});
export type SearchSuggestionsInput = z.infer<typeof SearchSuggestionsInputSchema>;

const SearchSuggestionsOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('An array of search suggestions based on the input text.'),
});
export type SearchSuggestionsOutput = z.infer<typeof SearchSuggestionsOutputSchema>;

/**
 * Wrapper function to call the dynamicSearchSuggestionsFlow.
 * @param {SearchSuggestionsInput} input - The input for the search suggestions.
 * @returns {Promise<SearchSuggestionsOutput>} - A promise that resolves to the search suggestions.
 */
export async function getSearchSuggestions(input: SearchSuggestionsInput): Promise<SearchSuggestionsOutput> {
  return dynamicSearchSuggestionsFlow(input);
}

const dynamicSearchSuggestionsPrompt = ai.definePrompt({
  name: 'dynamicSearchSuggestionsPrompt',
  input: {schema: SearchSuggestionsInputSchema},
  output: {schema: SearchSuggestionsOutputSchema},
  prompt: `You are a search suggestion assistant. Given the current text the user has typed, suggest relevant search queries.

  Current text: {{{searchText}}}

  Suggestions:`,
});

const dynamicSearchSuggestionsFlow = ai.defineFlow(
  {
    name: 'dynamicSearchSuggestionsFlow',
    inputSchema: SearchSuggestionsInputSchema,
    outputSchema: SearchSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await dynamicSearchSuggestionsPrompt(input);
    return output!;
  }
);
