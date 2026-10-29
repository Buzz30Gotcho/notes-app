import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

type NoteStatus = 'active' | 'completed'

interface Note {
  id: number;
  title: string;
  content: string;
  status: NoteStatus;
}

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly notes: Note[] = [
    {
      id: 1,
      title: 'Faire du sport',
      content: 'Préparer ma séance de la semaine',
      status: 'active',
    },

    {
      id: 2,
      title: 'Lire un chapitre',
      content: 'Continuer le livre commencé hier.',
      status: 'completed',
    },


  ]
}
