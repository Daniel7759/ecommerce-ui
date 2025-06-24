import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FlowbiteService } from './services/flowbite.service';
import { Fakestore } from './services/fakestore.service';
import { initFlowbite } from 'flowbite';
import { Menu } from "./components/menu/menu";
import { Footer } from "./components/footer/footer";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Menu, Footer, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit{
  protected title = 'FakeStore';

  constructor(
    private flowbiteService: FlowbiteService,
    private fakeStoreService: Fakestore
  ) {}

  ngOnInit(): void {
    this.flowbiteService.loadFlowbite((flowbite) => {
      initFlowbite();
    });
    
    // Precargar datos críticos al iniciar la aplicación
    console.log('🚀 Iniciando precarga de datos...');
    this.fakeStoreService.preloadCommonData();
  }
}
