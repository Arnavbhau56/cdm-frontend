// Deck API service: wraps all HTTP calls to the decks and setup backend endpoints.

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface DeckSummary {
  id: string;
  startup_name: string;
  status: string;
  created_at: string;
}

export interface Comment {
  id: string;
  body: string;
  author_name: string;
  created_at: string;
}

export interface DeckDetail extends DeckSummary {
  original_filename: string;
  business_model: string;
  industry_context: string;
  key_risks: string[];
  founder_questions: string[];
  error_message: string;
  pdf_url: string;
}

export interface FirmPreferences {
  sectors_focus: string;
  stage_focus: string;
  question_style: string;
  additional_context: string;
  updated_at?: string;
}

@Injectable({ providedIn: 'root' })
export class DeckService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  listDecks() {
    return this.http.get<DeckSummary[]>(`${this.base}/decks/`);
  }

  uploadDeck(file: File) {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<{ id: string; status: string }>(`${this.base}/decks/upload/`, form);
  }

  getDeck(id: string) {
    return this.http.get<DeckDetail>(`${this.base}/decks/${id}/`);
  }

  emailQuestions(id: string, recipient_email: string) {
    return this.http.post(`${this.base}/decks/${id}/email/`, { recipient_email });
  }

  getPreferences() {
    return this.http.get<FirmPreferences>(`${this.base}/setup/`);
  }

  savePreferences(data: FirmPreferences) {
    return this.http.put<FirmPreferences>(`${this.base}/setup/`, data);
  }

  getComments(deckId: string) {
    return this.http.get<Comment[]>(`${this.base}/decks/${deckId}/comments/`);
  }

  addComment(deckId: string, body: string) {
    return this.http.post<Comment>(`${this.base}/decks/${deckId}/comments/`, { body });
  }

  deleteComment(deckId: string, commentId: string) {
    return this.http.delete(`${this.base}/decks/${deckId}/comments/${commentId}/`);
  }
}
