import type { Metadata } from "next";
import { ContactLine, LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Politika privatnosti" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Politika privatnosti" updated="2. novembar 2026.">
      <section>
        <p>
          Dvaput je platforma za kupovinu i prodaju polovne odjeće. Ovdje piše koje podatke prikupljamo, zašto i kako s njima postupamo. Podatke ne prodajemo i ne
          dijelimo s oglašivačima.
        </p>
      </section>
      <section>
        <h2>Koje podatke prikupljamo</h2>
        <ul>
          <li>
            <strong>Podaci naloga:</strong> ime, email adresa i šifra (spremljena samo kao hash). Ako se prijavite preko Googlea, od Googlea dobijamo samo ime, email i
            profilnu sliku.
          </li>
          <li>
            <strong>Profil:</strong> grad i kratak opis, ako ih sami unesete.
          </li>
          <li>
            <strong>Sadržaj koji objavite:</strong> oglasi, fotografije, komentari, dojmovi i ocjene.
          </li>
          <li>
            <strong>Poruke:</strong> razgovori s drugim korisnicima o oglasima.
          </li>
          <li>
            <strong>Tehnički podaci:</strong> kolačić sesije koji vas drži prijavljenim, te IP adresa i podaci o pregledniku koje bilježi hosting radi sigurnosti.
          </li>
        </ul>
      </section>
      <section>
        <h2>Zašto ih koristimo</h2>
        <ul>
          <li>da biste mogli napraviti nalog, prijaviti se i resetovati šifru;</li>
          <li>da bi vaši oglasi, profil i dojmovi bili vidljivi drugim korisnicima;</li>
          <li>da biste mogli razgovarati s kupcima i prodavačima;</li>
          <li>da bismo spriječili zloupotrebe i održali platformu sigurnom.</li>
        </ul>
      </section>
      <section>
        <h2>Šta je javno</h2>
        <p>
          Ime, grad, opis profila, oglasi s fotografijama, komentari i dojmovi su javni. Email adresa i poruke nisu javni. Poruke vide samo učesnici razgovora.
        </p>
      </section>
      <section>
        <h2>Gdje se podaci čuvaju</h2>
        <p>
          Aplikacija radi na Vercelu, baza podataka je na Neonu, a fotografije na Vercel Blobu. Podaci se čuvaju u data centrima u Evropskoj uniji (Frankfurt).
          Emailove za reset šifre šaljemo preko SMTP servisa.
        </p>
      </section>
      <section>
        <h2>Kolačići</h2>
        <p>Koristimo samo neophodne kolačiće za prijavu. Nema kolačića za praćenje ni reklamu.</p>
      </section>
      <section>
        <h2>Vaša prava</h2>
        <p>
          Podatke profila možete izmijeniti u podešavanjima, a oglase i komentare obrisati u bilo kom trenutku. Ako želite kopiju svojih podataka ili brisanje
          cijelog naloga, <ContactLine /> i uradićemo to u razumnom roku.
        </p>
      </section>
      <section>
        <h2>Izmjene</h2>
        <p>Ako se ova politika promijeni, nova verzija će biti objavljena na ovoj stranici s novim datumom.</p>
      </section>
    </LegalPage>
  );
}
