import type { Metadata } from "next";
import Link from "next/link";
import { ContactLine, LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Uslovi korištenja" };

export default function TermsPage() {
  return (
    <LegalPage title="Uslovi korištenja" updated="2. novembar 2026.">
      <section>
        <p>Korištenjem Dvaputa prihvatate ove uslove. Ako se ne slažete s njima, nemojte koristiti platformu.</p>
      </section>
      <section>
        <h2>Šta je Dvaput</h2>
        <p>
          Dvaput je oglasnik koji povezuje kupce i prodavače polovne odjeće. Mi nismo strana u kupoprodaji: dogovor o cijeni, plaćanju, slanju i preuzimanju je
          isključivo između kupca i prodavača.
        </p>
      </section>
      <section>
        <h2>Nalog</h2>
        <ul>
          <li>Morate imati najmanje 16 godina ili saglasnost roditelja.</li>
          <li>Podaci koje unesete moraju biti tačni, a za sigurnost svoje šifre ste odgovorni vi.</li>
          <li>Jedna osoba ne smije koristiti nalog za lažno predstavljanje drugih.</li>
        </ul>
      </section>
      <section>
        <h2>Pravila za oglase</h2>
        <ul>
          <li>Prodajete samo stvari koje posjedujete i smijete prodati.</li>
          <li>Opis, stanje i fotografije moraju odgovarati stvarnom artiklu.</li>
          <li>Zabranjeni su krivotvoreni (replika) artikli, ukradena roba i sadržaj koji vrijeđa ili krši tuđa prava.</li>
          <li>Fotografije moraju biti vaše ili ih morate imati pravo koristiti.</li>
        </ul>
      </section>
      <section>
        <h2>Dojmovi i komunikacija</h2>
        <p>
          Dojmovi moraju biti iskreni i zasnovani na stvarnom kontaktu. Zabranjeni su spam, prevare i uznemiravanje kroz poruke ili komentare.
        </p>
      </section>
      <section>
        <h2>Odgovornost</h2>
        <p>
          Platformu pružamo &bdquo;kakva jeste&ldquo;. Ne garantujemo za kvalitet artikala, tačnost oglasa niti za izvršenje dogovora između korisnika. Savjetujemo
          lično preuzimanje ili plaćanje pouzećem kod nepoznatih prodavača.
        </p>
      </section>
      <section>
        <h2>Uklanjanje sadržaja i naloga</h2>
        <p>Možemo ukloniti oglase ili zatvoriti naloge koji krše ove uslove, bez prethodne najave.</p>
      </section>
      <section>
        <h2>Privatnost i kontakt</h2>
        <p>
          Kako postupamo s podacima piše u{" "}
          <Link href="/privatnost" className="text-ink underline underline-offset-4">
            politici privatnosti
          </Link>
          . Za pitanja <ContactLine />.
        </p>
      </section>
    </LegalPage>
  );
}
