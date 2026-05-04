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

export interface DeckNote {
  id: string;
  kind: 'general' | 'mis' | 'whatsapp' | 'call';
  title: string;
  body: string;
  created_by: string;
  created_at: string;
}

export interface InsightRating {
  dimension: string;
  score: string;
  rationale: string;
}

export interface DealInsight {
  stage_label: string;
  stage_rationale: string;
  ratings: InsightRating[];
  key_metrics: { label: string; value: string }[];
  comparables: { name: string; geography: string; note: string }[];
  overall_score: number;
  score_rationale: string;
  recommendation: string;
  recommendation_rationale: string;
  one_line_verdict: string;
}

export interface CompetitorEntry {
  name: string;
  description: string;
  scale: string;
  relevance: string;
}

export interface TrendEntry {
  trend: string;
  detail: string;
}

export interface CompetitiveLandscape {
  market_structure: string;
  competitors_india: CompetitorEntry[];
  competitors_global: CompetitorEntry[];
  trends: TrendEntry[];
}

export interface IndustryContext {
  value_chain_position: string;
  market_size: string;
  market_timing: string;
  competitive_landscape: CompetitiveLandscape | string; // string = legacy
  unit_economics: string;
  regulatory: string;
  failure_modes: string;
  winners_playbook: string;
  legacy?: string;
}

export interface FounderQuestion {
  question: string;
  answer: string;
}

export interface DeckDetail extends DeckSummary {
  original_filename: string;
  registered_name: string;
  sub_sector: string;
  one_liner: string;
  business_model: string;
  industry_context: IndustryContext;
  key_risks: string[];
  founder_questions: FounderQuestion[];
  emailed_questions: number[];
  call_notes: Record<string, string>;
  error_message: string;
  pdf_url: string;
  founder_email: string;
  materials: DeckMaterial[];
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

  getNotes(deckId: string) {
    return this.http.get<DeckNote[]>(`${this.base}/decks/${deckId}/notes/`);
  }

  addNote(deckId: string, kind: string, title: string, body: string) {
    return this.http.post<DeckNote>(`${this.base}/decks/${deckId}/notes/`, { kind, title, body });
  }

  deleteNote(deckId: string, noteId: string) {
    return this.http.delete(`${this.base}/decks/${deckId}/notes/${noteId}/`);
  }

  getInsight(deckId: string) {
    return this.http.post<DealInsight>(`${this.base}/decks/${deckId}/insight/`, {});
  }

  saveCallNotes(id: string, call_notes: Record<string, string>) {
    return this.http.patch<{ call_notes: Record<string, string> }>(`${this.base}/decks/${id}/call-notes/`, { call_notes });
  }

  autoAnswerQuestions(id: string) {
    return this.http.post<{ founder_questions: FounderQuestion[]; updated: number }>(`${this.base}/decks/${id}/auto-answer/`, {});
  }

  suggestQuestions(id: string, prompt: string) {
    return this.http.post<{ suggestions: string[] }>(`${this.base}/decks/${id}/suggest-questions/`, { prompt });
  }

  saveQuestions(id: string, founder_questions: FounderQuestion[]) {
    return this.http.patch<{ founder_questions: FounderQuestion[] }>(`${this.base}/decks/${id}/questions/`, { founder_questions });
  }

  updateFounderContact(id: string, data: { founder_email: string }) {
    return this.http.patch<{ founder_email: string }>(
      `${this.base}/decks/${id}/founder/`, data
    );
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
