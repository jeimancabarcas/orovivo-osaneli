import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-details',
  imports: [],
  template: `
    <section class="py-24 sm:py-32 px-4 sm:px-8 bg-gradient-to-b from-[#111111] to-[#0A1721] relative overflow-hidden">
      
      <div class="max-w-7xl mx-auto">
        
        <div class="text-center max-w-3xl mx-auto flex flex-col items-center gap-4 mb-20" data-reveal>
          <span class="text-gold-aged text-xs font-bold tracking-[0.3em] uppercase">ESPECIFICACIONES DE DISEÑADOR</span>
          <h2 class="font-display text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Cada Hilo Cuenta una Historia
          </h2>
          <p class="font-sans text-sm sm:text-base text-neutral-400 leading-relaxed max-w-2xl">
            No escatimamos en nada. Desde la selección del hilo hasta la estructura de caída pesada, esta camiseta está concebida como una pieza de colección de alta gama.
          </p>
        </div>

        <!-- Grid of technical specs -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          <!-- Spec 1: Boxy Cut -->
          <div 
            class="p-6 rounded-2xl glass-effect flex flex-col gap-4 hover:border-gold-aged/30 hover:shadow-[0_12px_30px_rgba(197,168,84,0.1)] transition-all duration-300 transform hover:-translate-y-1"
            data-reveal 
            data-delay="0.1"
          >
            <div class="w-12 h-12 rounded-xl bg-gold-aged/10 flex items-center justify-center border border-gold-aged/20">
              <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="#C5A854"><path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Z"/></svg>
            </div>
            <h3 class="text-lg font-bold font-serif tracking-wider text-white">Corte Boxy Moderno</h3>
            <p class="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              Inspirado en el streetwear urbano de élite de los 90. Hombros caídos de ajuste relajado y largo recortado que brinda un look estructurado y limpio sin arrugas excesivas.
            </p>
          </div>

          <!-- Spec 2: Heavyweight Cotton -->
          <div 
            class="p-6 rounded-2xl glass-effect flex flex-col gap-4 hover:border-gold-aged/30 hover:shadow-[0_12px_30px_rgba(197,168,84,0.1)] transition-all duration-300 transform hover:-translate-y-1"
            data-reveal 
            data-delay="0.2"
          >
            <div class="w-12 h-12 rounded-xl bg-gold-aged/10 flex items-center justify-center border border-gold-aged/20">
              <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="#C5A854"><path d="M120-120v-80h720v80H120Zm0-160v-440h720v440H120Zm80-80h560v-280H200v280Z"/></svg>
            </div>
            <h3 class="text-lg font-bold font-serif tracking-wider text-white">Algodón de 280g/m²</h3>
            <p class="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              Tejido de alto gramaje que se siente robusto y premium al tacto. No se adhiere al cuerpo, proporcionando una caída y silueta rígida y estructurada al andar.
            </p>
          </div>

          <!-- Spec 3: Monochrome Shield -->
          <div 
            class="p-6 rounded-2xl glass-effect flex flex-col gap-4 hover:border-gold-aged/30 hover:shadow-[0_12px_30px_rgba(197,168,84,0.1)] transition-all duration-300 transform hover:-translate-y-1"
            data-reveal 
            data-delay="0.3"
          >
            <div class="w-12 h-12 rounded-xl bg-gold-aged/10 flex items-center justify-center border border-gold-aged/20">
              <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="#C5A854"><path d="M480-120 160-280v-400l320-160 320 160v400L480-120Zm0-92 240-120v-308L480-780 240-640v308l240 120Z"/></svg>
            </div>
            <h3 class="text-lg font-bold font-serif tracking-wider text-white">Escudo en Relieve</h3>
            <p class="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              El escudo histórico nacional esculpido mediante un grabado en alta frecuencia de relieve 3D monocromático. Una reinterpretación de sofisticación que une calle y elegancia.
            </p>
          </div>

          <!-- Spec 4: Hidden Embroidery -->
          <div 
            class="p-6 rounded-2xl glass-effect flex flex-col gap-4 hover:border-gold-aged/30 hover:shadow-[0_12px_30px_rgba(197,168,84,0.1)] transition-all duration-300 transform hover:-translate-y-1"
            data-reveal 
            data-delay="0.4"
          >
            <div class="w-12 h-12 rounded-xl bg-gold-aged/10 flex items-center justify-center border border-gold-aged/20">
              <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="#C5A854"><path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-32q0-34 17.5-62.5T224-296q64-34 135-51t121-17q50 0 121 17t135 51q30 16 47.5 44.5T800-192v32H160Z"/></svg>
            </div>
            <h3 class="text-lg font-bold font-serif tracking-wider text-white">Bordado Secreto</h3>
            <p class="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              "SOMOS ORO". Dos palabras doradas grabadas en el interior de la solapa del cuello. Visible solo al levantar el cuello, un sello secreto e íntimo para quienes conocen su riqueza.
            </p>
          </div>

        </div>

        <!-- Technical Size Chart Boxy fit -->
        <div class="mt-20 glass-effect rounded-3xl p-6 sm:p-10 flex flex-col lg:flex-row items-center gap-10" data-reveal>
          <div class="w-full lg:w-1/2 flex flex-col gap-4">
            <span class="text-gold-aged text-xs font-bold tracking-widest uppercase">CONSEJO DE TALLA</span>
            <h3 class="text-2xl font-serif font-black text-white">Tallaje Boxy: Estructura Streetwear</h3>
            <p class="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              Recomendamos elegir tu talla habitual para obtener el ajuste boxy premium de hombros caídos característico. Si prefieres un ajuste más entallado o clásico, elige una talla menos.
            </p>
            <div class="flex flex-wrap gap-4 text-xs font-bold font-sans text-neutral-400">
              <span class="px-3 py-1.5 rounded-lg bg-neutral-900 border border-white/5"><strong class="text-white font-serif">Algodón:</strong> 100% Peinado Orgánico</span>
              <span class="px-3 py-1.5 rounded-lg bg-neutral-900 border border-white/5"><strong class="text-white font-serif">Hecho En:</strong> Colombia (Herencia y Sello local)</span>
              <span class="px-3 py-1.5 rounded-lg bg-neutral-900 border border-white/5"><strong class="text-white font-serif">Cuidado:</strong> Lavar al revés con agua fría</span>
            </div>
          </div>
          
          <div class="w-full lg:w-1/2 overflow-x-auto rounded-xl border border-white/5">
            <table class="w-full text-left text-xs font-sans">
              <thead class="bg-neutral-900 text-neutral-400 uppercase tracking-widest font-bold border-b border-white/5">
                <tr>
                  <th class="p-4">Talla (Boxy)</th>
                  <th class="p-4">Ancho Pecho (cm)</th>
                  <th class="p-4">Largo (cm)</th>
                  <th class="p-4">Recomendado por Altura</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5 text-neutral-300">
                <tr class="hover:bg-white/5 transition-all duration-200 hover:scale-[1.01] origin-left">
                  <td class="p-4 font-bold text-white">S</td>
                  <td class="p-4">56 cm</td>
                  <td class="p-4">68 cm</td>
                  <td class="p-4">1.60m - 1.70m</td>
                </tr>
                <tr class="hover:bg-white/5 transition-all duration-200 hover:scale-[1.01] origin-left">
                  <td class="p-4 font-bold text-white">M</td>
                  <td class="p-4">59 cm</td>
                  <td class="p-4">71 cm</td>
                  <td class="p-4">1.70m - 1.78m</td>
                </tr>
                <tr class="hover:bg-white/5 transition-all duration-200 hover:scale-[1.01] origin-left">
                  <td class="p-4 font-bold text-white">L</td>
                  <td class="p-4">62 cm</td>
                  <td class="p-4">74 cm</td>
                  <td class="p-4">1.78m - 1.85m</td>
                </tr>
                <tr class="hover:bg-white/5 transition-all duration-200 hover:scale-[1.01] origin-left">
                  <td class="p-4 font-bold text-white">XL</td>
                  <td class="p-4">65 cm</td>
                  <td class="p-4">76 cm</td>
                  <td class="p-4">1.85m - 1.92m</td>
                </tr>
                <tr class="hover:bg-white/5 transition-all duration-200 hover:scale-[1.01] origin-left">
                  <td class="p-4 font-bold text-white">XXL</td>
                  <td class="p-4">68 cm</td>
                  <td class="p-4">78 cm</td>
                  <td class="p-4">1.92m +</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DetailsComponent {}
