// Deck API service: wraps all HTTP calls to the decks and setup backend endpoints.

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface DeckSummary {
  id: string;
  startup_name: string;
  sector: string;
  status: string;
  crm_status: string;
  founder_email: string;
  created_at: string;
  latest_comment: { body: string; author_name: string } | null;
}

export interface Comment {
  id: string;
  body: string;
  author_name: string;
  created_at: string;
}

export interface DeckMaterial {
  id: string;
  name: string;
  url: string;
  created_at: string;
}

export interface FounderQuestion {
  question: string;
  answer: string;
}

export interface DeckDetail extends DeckSummary {
  original_filename: string;
  business_model: string;
  industry_context: string;
  key_risks: string[];
  founder_questions: FounderQuestion[];
  emailed_questions: number[];
  call_notes: Record<string, string>;
  error_message: string;
  pdf_url: string;
  founder_email: string;
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

  listDecks(filters: { sector?: string; crm_status?: string } = {}) {
    let params = new HttpParams();
    if (filters.sector) params = params.set('sector', filters.sector);
    if (filters.crm_status) params = params.set('crm_status', filters.crm_status);
    return this.http.get<DeckSummary[]>(`${this.base}/decks/`, { params });
  }

  uploadDeck(file: File) {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<{ id: string; status: string }>(`${this.base}/decks/upload/`, form);
  }

  getDeck(id: string) {
    return this.http.get<DeckDetail>(`${this.base}/decks/${id}/`);
  }

  deleteDeck(id: string) {
    return this.http.delete(`${this.base}/decks/${id}/`);
  }

  bulkDeleteDecks(ids: string[]) {
    return this.http.post<{ deleted: number }>(`${this.base}/decks/bulk-delete/`, { ids });
  }

  updateCrmStatus(id: string, crm_status: string) {
    return this.http.patch<{ crm_status: string }>(`${this.base}/decks/${id}/crm-status/`, { crm_status });
  }

  emailQuestions(id: string, recipient_email: string, selected_indices: number[]) {
    return this.http.post<{ message: string; emailed_questions: number[] }>(
      `${this.base}/decks/${id}/email/`, { recipient_email, selected_indices }
    );
  }

  getMaterials(deckId: string) {
    return this.http.get<DeckMaterial[]>(`${this.base}/decks/${deckId}/materials/`);
  }

  uploadMaterial(deckId: string, file: File) {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<DeckMaterial>(`${this.base}/decks/${deckId}/materials/`, form);
  }

  deleteMaterial(deckId: string, materialId: string) {
    return this.http.delete(`${this.base}/decks/${deckId}/materials/${materialId}/`);
  }

  saveCallNotes(id: string, call_notes: Record<string, string>) {
    return this.http.patch<{ call_notes: Record<string, string> }>(`${this.base}/decks/${id}/call-notes/`, { call_notes });
  }

  autoAnswerQuestions(id: string) {
    return this.http.post<{ founder_questions: FounderQuestion[]; updated: number }>(`${this.base}/decks/${id}/auto-answer/`, {});
  }

  saveQuestions(id: string, founder_questions: FounderQuestion[]) {
    return this.http.patch<{ founder_questions: FounderQuestion[] }>(`${this.base}/decks/${id}/questions/`, { founder_questions });
  }

  updateFounderContact(id: string, data: { founder_email: string }) {
    return this.http.patch<{ founder_email: string }>(
      `${this.base}/decks/${id}/founder/`, data
    );
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
