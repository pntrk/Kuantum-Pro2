import xml.etree.ElementTree as ET
from collections import defaultdict

with open("user_sample.xml", "w", encoding="utf-8") as f:
    f.write("""<DersProgrami>
    <GenelBilgiler>
        <DersSuresi Sabitmi="E" Sure="40"/>
        <DosyaOzellikleri Tarih="08.09.2026 17:20:17" DagitmatikVer="v2.12 (79.25.265)"/>
    </GenelBilgiler>
    <Gunler>
        <Gun Adi="Pazartesi" id="7" SaatSayisi="9">
            <Saat Baslangic="08:40" Bitis="09:20" id="12"/>
            <Saat Baslangic="09:35" Bitis="10:15" id="17"/>
            <Saat Baslangic="10:35" Bitis="11:15" id="22"/>
            <Saat Baslangic="11:30" Bitis="12:10" id="27"/>
            <Saat Baslangic="13:15" Bitis="13:55" id="32"/>
            <Saat Baslangic="14:10" Bitis="14:50" id="37"/>
            <Saat Baslangic="15:05" Bitis="15:45" id="42"/>
            <Saat Baslangic="16:00" Bitis="16:40" id="1839"/>
            <Saat Baslangic="16:40" Bitis="17:20" id="1947"/>
        </Gun>
        <Gun Adi="Salı" id="8" SaatSayisi="9">
            <Saat Baslangic="08:40" Bitis="09:20" id="1900"/>
            <Saat Baslangic="09:35" Bitis="10:15" id="1901"/>
            <Saat Baslangic="10:35" Bitis="11:15" id="1902"/>
            <Saat Baslangic="11:30" Bitis="12:10" id="1903"/>
            <Saat Baslangic="13:15" Bitis="13:55" id="1904"/>
            <Saat Baslangic="14:10" Bitis="14:50" id="1905"/>
            <Saat Baslangic="15:05" Bitis="15:45" id="1906"/>
            <Saat Baslangic="16:00" Bitis="16:40" id="1907"/>
            <Saat Baslangic="16:40" Bitis="17:20" id="1948"/>
        </Gun>
        <Gun Adi="Çarşamba" id="9" SaatSayisi="9">
            <Saat Baslangic="08:40" Bitis="09:20" id="1908"/>
            <Saat Baslangic="09:35" Bitis="10:15" id="1909"/>
            <Saat Baslangic="10:35" Bitis="11:15" id="1910"/>
            <Saat Baslangic="11:30" Bitis="12:10" id="1911"/>
            <Saat Baslangic="13:15" Bitis="13:55" id="1912"/>
            <Saat Baslangic="14:10" Bitis="14:50" id="1913"/>
            <Saat Baslangic="15:05" Bitis="15:45" id="1914"/>
            <Saat Baslangic="16:00" Bitis="16:40" id="1915"/>
            <Saat Baslangic="16:40" Bitis="17:20" id="1949"/>
        </Gun>
        <Gun Adi="Perşembe" id="10" SaatSayisi="9">
            <Saat Baslangic="08:40" Bitis="09:20" id="1916"/>
            <Saat Baslangic="09:35" Bitis="10:15" id="1917"/>
            <Saat Baslangic="10:35" Bitis="11:15" id="1918"/>
            <Saat Baslangic="11:30" Bitis="12:10" id="1919"/>
            <Saat Baslangic="13:15" Bitis="13:55" id="1920"/>
            <Saat Baslangic="14:10" Bitis="14:50" id="1921"/>
            <Saat Baslangic="15:05" Bitis="15:45" id="1922"/>
            <Saat Baslangic="16:00" Bitis="16:40" id="1923"/>
            <Saat Baslangic="16:40" Bitis="17:20" id="1950"/>
        </Gun>
        <Gun Adi="Cuma" id="11" SaatSayisi="9">
            <Saat Baslangic="08:40" Bitis="09:20" id="1924"/>
            <Saat Baslangic="09:35" Bitis="10:15" id="1925"/>
            <Saat Baslangic="10:35" Bitis="11:15" id="1926"/>
            <Saat Baslangic="11:30" Bitis="12:10" id="1927"/>
            <Saat Baslangic="13:15" Bitis="13:55" id="1928"/>
            <Saat Baslangic="14:10" Bitis="14:50" id="1929"/>
            <Saat Baslangic="15:05" Bitis="15:45" id="1930"/>
            <Saat Baslangic="16:00" Bitis="16:40" id="1931"/>
            <Saat Baslangic="16:40" Bitis="17:20" id="1951"/>
        </Gun>
        <Gun Adi="Cumartesi" id="2829" SaatSayisi="4">
            <Saat Baslangic="09:30" Bitis="10:10" id="2830"/>
            <Saat Baslangic="10:20" Bitis="11:00" id="2831"/>
            <Saat Baslangic="11:10" Bitis="11:50" id="2832"/>
            <Saat Baslangic="12:00" Bitis="12:40" id="2833"/>
        </Gun>
    </Gunler>
    <Dersler>
        <Ders Adi="DYK" Renk="#32c078" id="2834" KisaAdi="DYK"/>
        <Ders Adi="TÜRKÇE" Renk="#aa00ff" id="1972" KisaAdi="TÜRK"/>
        <Ders Adi="MATEMATİK" Renk="#aa0000" id="2070" KisaAdi="MAT"/>
        <Ders Adi="FEN BİLİMLERİ" Renk="#00ff00" id="2175" KisaAdi="FEN"/>
        <Ders Adi="T.C. İNKILAP TARİHİ VE ATATÜRKÇÜLÜK" Renk="#ff0000" id="2310" KisaAdi="İNK"/>
        <Ders Adi="SOSYAL BİLGİLER" Renk="#55ffff" id="2257" KisaAdi="SOS"/>
        <Ders Adi="YABANCI DİL ETKİNLİK" Renk="#ed647b" id="2837" KisaAdi="ETKİNLİK"/>
        <Ders Adi="İNGİLİZCE" Renk="#395bc3" id="2321" KisaAdi="İNG"/>
        <Ders Adi="DİN KÜLTÜRÜ VE AHLAK BİLGİSİ" Renk="#c47af4" id="2389" KisaAdi="DKAB"/>
        <Ders Adi="GÖRSEL SANATLAR" Renk="#aab9ca" id="2434" KisaAdi="SANAT"/>
        <Ders Adi="BEDEN EĞİTİMİ VE SPOR" Renk="#cf8766" id="2479" KisaAdi="BEDEN"/>
        <Ders Adi="MÜZİK" Renk="#a645f8" id="2524" KisaAdi="MÜZİK"/>
        <Ders Adi="BİLİŞİM TEKNOLOJİLERİ VE YAZILIM" Renk="#faab49" id="2569" KisaAdi="BİLG"/>
        <Ders Adi="TEKNOLOJİ VE TASARIM" Renk="#a5bf9f" id="2594" KisaAdi="TEKNO"/>
        <Ders Adi="REHBERLİK VE YÖNLENDİRME" Renk="#c8dcfd" id="2618" KisaAdi="REHBE"/>
        <Ders Adi="SEÇMELİ OKUMA BECERİLERİ" Renk="#eb3e65" id="2644" KisaAdi="OKUMA"/>
        <Ders Adi="SEÇMELİ MATEMATİK VE BİLİM UYGULAMALARI" Renk="#82f911" id="2646" KisaAdi="BİLİM"/>
        <Ders Adi="SEÇMELİ GÖRGÜ KURALLARI VE NEZAKET" Renk="#c6ad41" id="2649" KisaAdi="GÖRGÜ"/>
        <Ders Adi="SEÇMELİ AHLAK VE YURTTAŞLIK EĞİTİMİ" Renk="#ec0f8f" id="2648" KisaAdi="AHLAK"/>
        <Ders Adi="SEÇMELİ YABANCI DİL" Renk="#fe223d" id="3323" KisaAdi="SEÇİNG"/>
        <Ders Adi="SEÇMELİ SPOR VE FİZİKİ ETKİNLİKLER" Renk="#aef1b5" id="3377" KisaAdi="SPOR"/>
        <Ders Adi="SEÇMELİ YAZARLIK VE YAZMA BECERİLERİ" Renk="#e8f300" id="4729" KisaAdi="YAZAR"/>
        <Ders Adi="SEÇMELİ TEMEL DİNİ BİLGİLER" Renk="#7d9265" id="4730" KisaAdi="TEMELDİN"/>
        <Ders Adi="SEÇMELİ PEYGAMBERİMİZİN HAYATI" Renk="#d95d78" id="4733" KisaAdi="SİYER"/>
        <Ders Adi="SEÇMELİ HUKUK VE ADALET" Renk="#dcf9b4" id="4793" KisaAdi="HUKUK"/>
        <Ders Adi="SEÇMELİ OYUN VE OYUN ETKİNLİKLERİ" Renk="#0dcb8f" id="4732" KisaAdi="OYUN"/>
        <Ders Adi="SEÇMELİ ÇEVRE VE İKLİM DEĞİŞİKLİĞİ" Renk="#acff04" id="4794" KisaAdi="ÇEVRE"/>
        <Ders Adi="SEÇMELİ KÜLTÜR VE MEDENİYETİMİZE YÖN VERENLER" Renk="#ecb879" id="4795" KisaAdi="KÜLTÜR"/>
        <Ders Adi="DESTEK EĞİTİM" Renk="#76f9db" id="2938" KisaAdi="DESEĞ"/>
    </Dersler>
    <Ogretmenler>
        <Ogretmen Adi="HİDAYET AS" Renk="#5acc73" id="803" KisaAdi="AS"/>
        <Ogretmen Adi="HARUN BARIŞ TAHTACI" Renk="#ef6e2b" id="66" KisaAdi="HBT"/>
        <Ogretmen Adi="BAHADIR ŞAFAK KUMCU" Renk="#f96caa" id="67" KisaAdi="BŞK"/>
        <Ogretmen Adi="ÇİSEM ALTINOVA" Renk="#89f043" id="68" KisaAdi="ÇİSEM"/>
        <Ogretmen Adi="YEŞİM BİÇER" Renk="#f96dc7" id="69" KisaAdi="YEŞİM"/>
        <Ogretmen Adi="NURÇİN BÜYÜKYAKALI" Renk="#f5e963" id="70" KisaAdi="NURÇİ"/>
        <Ogretmen Adi="ŞEBNEM CİVAŞ" Renk="#63cb48" id="71" KisaAdi="CİVAŞ"/>
        <Ogretmen Adi="ŞEREF ÖZCAN" Renk="#e54434" id="72" KisaAdi="ŞEREF"/>
        <Ogretmen Adi="ÖZGE KÜÇÜKDEMİR" Renk="#a98334" id="73" KisaAdi="ÖZGE"/>
        <Ogretmen Adi="SEMRA IŞIKLAR" Renk="#cfa425" id="74" KisaAdi="SEMRA"/>
        <Ogretmen Adi="HİLMİ PALA" Renk="#e3fe18" id="3042" KisaAdi="PALA"/>
        <Ogretmen Adi="YELİZ TUNÇ" Renk="#d5a158" id="75" KisaAdi="YELİZ"/>
        <Ogretmen Adi="BİLAL AKAR" Renk="#cfc833" id="76" KisaAdi="BİLAL"/>
        <Ogretmen Adi="EMEL AYDIN" Renk="#9f3fe6" id="77" KisaAdi="EMEL"/>
        <Ogretmen Adi="BÜŞRA SELCEN SERDAROĞLU" Renk="#7c9fa0" id="79" KisaAdi="SELCEN"/>
        <Ogretmen Adi="NAGİHAN ÇİÇEN" Renk="#86bd57" id="4864" KisaAdi="ÇİÇEN"/>
        <Ogretmen Adi="AYŞE GÜL DEMİR" Renk="#d14f91" id="80" KisaAdi="AYŞE"/>
        <Ogretmen Adi="ALPER KAYA" Renk="#cd82d5" id="81" KisaAdi="ALPER"/>
        <Ogretmen Adi="SİBEL ÜLKER" Renk="#79e214" id="82" KisaAdi="ÜLKER"/>
        <Ogretmen Adi="OYA KIZILARSLAN" Renk="#eb12c5" id="83" KisaAdi="OYA"/>
        <Ogretmen Adi="DERYA ERTUĞRUL" Renk="#a6c511" id="84" KisaAdi="DERYA"/>
        <Ogretmen Adi="ÖZNUR KANAL" Renk="#633fe1" id="85" KisaAdi="ÖZNUR"/>
        <Ogretmen Adi="ORHAN BÜYÜKYILMAZ" Renk="#f9bd16" id="86" KisaAdi="ORHAN"/>
        <Ogretmen Adi="FUNDA GÜNER" Renk="#bd46dd" id="87" KisaAdi="FUNDA"/>
        <Ogretmen Adi="MEHMET ABUY" Renk="#c6f894" id="88" KisaAdi="ABUY"/>
        <Ogretmen Adi="PINAR BAYKUL" Renk="#a0f14b" id="804" KisaAdi="PINAR"/>
        <Ogretmen Adi="ERNUR YAMAN" Renk="#f7d200" id="3379" KisaAdi="ERNUR"/>
        <Ogretmen Adi="SİBEL AĞGÜL" Renk="#3a7dbe" id="89" KisaAdi="AĞGÜL"/>
        <Ogretmen Adi="AYSEL GÜNDÜZ" Renk="#4c5fe5" id="90" KisaAdi="AYSEL"/>
        <Ogretmen Adi="ZAFER KALKAN" Renk="#e88850" id="91" KisaAdi="ZAFER"/>
        <Ogretmen Adi="MELEK ÖZTÜRK" Renk="#f9a823" id="1932" KisaAdi="MELEK"/>
        <Ogretmen Adi="ZEYNEP GÜVEN" Renk="#6be3e3" id="3426" KisaAdi="ZEYNEP"/>
        <Ogretmen Adi="SADIK ÇELİK" Renk="#84c06a" id="93" KisaAdi="SADIK"/>
        <Ogretmen Adi="KADER MALLI" Renk="#b3cdff" id="3520" KisaAdi="KADER"/>
        <Ogretmen Adi="DENİZ KALPAKOĞLU" Renk="#11c7a1" id="806" KisaAdi="DENİZ"/>
        <Ogretmen Adi="NAHİDE CANAN ŞUMNU" Renk="#5413fd" id="95" KisaAdi="CANAN"/>
        <Ogretmen Adi="ALPTEKİN BAŞTÜRK" Renk="#838882" id="96" KisaAdi="ALPTE"/>
        <Ogretmen Adi="SERTER IŞIKLAR" Renk="#dc8162" id="97" KisaAdi="SERTE"/>
        <Ogretmen Adi="SEVGİ KIRMACI" Renk="#d751dd" id="99" KisaAdi="SEVGİ"/>
        <Ogretmen Adi="BİRCAN ÖZTRAK" Renk="#57cbb4" id="1563" KisaAdi="BİRÖZ"/>
    </Ogretmenler>
    <Siniflar>
        <Sinif Adi="5A" Grupmu="H" Renk="#b0b8e1" AnaSinif="" id="119" KisaAdi="5A"/>
        <Sinif Adi="5B" Grupmu="H" Renk="#602ed8" AnaSinif="" id="120" KisaAdi="5B"/>
        <Sinif Adi="5C" Grupmu="H" Renk="#c2ab47" AnaSinif="" id="1966" KisaAdi="5C"/>
        <Sinif Adi="5D" Grupmu="H" Renk="#9695b3" AnaSinif="" id="116" KisaAdi="5D"/>
        <Sinif Adi="5E" Grupmu="H" Renk="#7b7099" AnaSinif="" id="117" KisaAdi="5E"/>
        <Sinif Adi="5F" Grupmu="H" Renk="#348fae" AnaSinif="" id="118" KisaAdi="5F"/>
        <Sinif Adi="6A" Grupmu="H" Renk="#729fce" AnaSinif="" id="1967" KisaAdi="6A"/>
        <Sinif Adi="6B" Grupmu="H" Renk="#a48777" AnaSinif="" id="1968" KisaAdi="6B"/>
        <Sinif Adi="6C" Grupmu="H" Renk="#917560" AnaSinif="" id="1969" KisaAdi="6C"/>
        <Sinif Adi="6D" Grupmu="H" Renk="#888ced" AnaSinif="" id="1970" KisaAdi="6D"/>
        <Sinif Adi="6E" Grupmu="H" Renk="#ef25be" AnaSinif="" id="1971" KisaAdi="6E"/>
        <Sinif Adi="6F" Grupmu="H" Renk="#ac0997" AnaSinif="" id="3285" KisaAdi="6F"/>
        <Sinif Adi="7A" Grupmu="H" Renk="#47d9f6" AnaSinif="" id="106" KisaAdi="7A"/>
        <Sinif Adi="7B" Grupmu="H" Renk="#5489af" AnaSinif="" id="107" KisaAdi="7B"/>
        <Sinif Adi="7C" Grupmu="H" Renk="#dab774" AnaSinif="" id="108" KisaAdi="7C"/>
        <Sinif Adi="7D" Grupmu="H" Renk="#9bf7bb" AnaSinif="" id="109" KisaAdi="7D"/>
        <Sinif Adi="7E" Grupmu="H" Renk="#51989a" AnaSinif="" id="110" KisaAdi="7E"/>
        <Sinif Adi="7F" Grupmu="H" Renk="#ad6cb8" AnaSinif="" id="3570" KisaAdi="7F"/>
        <Sinif Adi="8A" Grupmu="H" Renk="#42afec" AnaSinif="" id="111" KisaAdi="8A"/>
        <Sinif Adi="8B" Grupmu="H" Renk="#d393dd" AnaSinif="" id="112" KisaAdi="8B"/>
        <Sinif Adi="8C" Grupmu="H" Renk="#ca51c6" AnaSinif="" id="113" KisaAdi="8C"/>
        <Sinif Adi="8D" Grupmu="H" Renk="#7a906b" AnaSinif="" id="114" KisaAdi="8D"/>
        <Sinif Adi="8-1 DYK" Grupmu="H" Renk="#56c97c" AnaSinif="" id="2787" KisaAdi="8-1"/>
        <Sinif Adi="8-2 DYK" Grupmu="H" Renk="#d0eb95" AnaSinif="" id="2786" KisaAdi="8-2"/>
        <Sinif Adi="8-3 DYK" Grupmu="H" Renk="#f9bf3a" AnaSinif="" id="3544" KisaAdi="8-3"/>
        <Sinif Adi="8-4 DYK" Grupmu="H" Renk="#d2a258" AnaSinif="" id="3545" KisaAdi="8-4"/>
        <Sinif Adi="DESTEK EĞİTİM" Grupmu="H" Renk="#b1daf4" AnaSinif="" id="2788" KisaAdi="DESEĞ"/>
        <Sinif Adi="5-1 GRUP" Grupmu="H" Renk="#a526ca" AnaSinif="" id="3427" KisaAdi="5-1"/>
        <Sinif Adi="5-2 GRUP" Grupmu="H" Renk="#da628f" AnaSinif="" id="3428" KisaAdi="5-2"/>
        <Sinif Adi="6-1 GRUP" Grupmu="H" Renk="#eb3bb3" AnaSinif="" id="4878" KisaAdi="6-1"/>
        <Sinif Adi="6-2 GRUP" Grupmu="H" Renk="#19cb74" AnaSinif="" id="4879" KisaAdi="6-2"/>
    </Siniflar>
    <Derslikler/>
    <Ogrenciler/>
    <TanimliDersler>
        <TanimliDers id="1986" Siniflar="119" Ders="1972" Ogretmenler="74">
            <Kart Yerlesim="27,32" Saat="2" id="1987" Derslikler=""/>
            <Kart Yerlesim="1924,1925" Saat="2" id="1988" Derslikler=""/>
            <Kart Yerlesim="1905,1906" Saat="2" id="4613" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="1994" Siniflar="1967" Ders="1972" Ogretmenler="72">
            <Kart Yerlesim="1909,1910" Saat="2" id="1995" Derslikler=""/>
            <Kart Yerlesim="32,37" Saat="2" id="1996" Derslikler=""/>
            <Kart Yerlesim="1902,1903" Saat="2" id="4624" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="2026" Siniflar="106" Ders="1972" Ogretmenler="70">
            <Kart Yerlesim="1903,1904" Saat="2" id="2027" Derslikler=""/>
            <Kart Yerlesim="1927,1928" Saat="2" id="2028" Derslikler=""/>
            <Kart Yerlesim="1910" Saat="1" id="2029" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="2046" Siniflar="111" Ders="1972" Ogretmenler="71">
            <Kart Yerlesim="17,22" Saat="2" id="2047" Derslikler=""/>
            <Kart Yerlesim="1910,1911" Saat="2" id="2048" Derslikler=""/>
            <Kart Yerlesim="1920" Saat="1" id="2049" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="2083" Siniflar="119" Ders="2070" Ogretmenler="4864">
            <Kart Yerlesim="12,17" Saat="2" id="2084" Derslikler=""/>
            <Kart Yerlesim="1901,1902" Saat="2" id="2085" Derslikler=""/>
            <Kart Yerlesim="1910" Saat="1" id="2086" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="2107" Siniflar="1967" Ders="2070" Ogretmenler="76">
            <Kart Yerlesim="12,17" Saat="2" id="2108" Derslikler=""/>
            <Kart Yerlesim="1911,1912" Saat="2" id="3407" Derslikler=""/>
            <Kart Yerlesim="1922" Saat="1" id="2110" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="2119" Siniflar="106" Ders="2070" Ogretmenler="79">
            <Kart Yerlesim="1929,1930" Saat="2" id="2120" Derslikler=""/>
            <Kart Yerlesim="1911,1912" Saat="2" id="3409" Derslikler=""/>
            <Kart Yerlesim="22" Saat="1" id="2896" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="2151" Siniflar="111" Ders="2070" Ogretmenler="75">
            <Kart Yerlesim="1924,1925" Saat="2" id="2152" Derslikler=""/>
            <Kart Yerlesim="1904,1905" Saat="2" id="3411" Derslikler=""/>
            <Kart Yerlesim="1912" Saat="1" id="2154" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="2188" Siniflar="1969" Ders="2175" Ogretmenler="83">
            <Kart Yerlesim="12,17" Saat="2" id="2189" Derslikler=""/>
            <Kart Yerlesim="1927,1928" Saat="2" id="2190" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="2200" Siniflar="1967" Ders="2175" Ogretmenler="81">
            <Kart Yerlesim="1924,1925" Saat="2" id="2201" Derslikler=""/>
            <Kart Yerlesim="1913,1914" Saat="2" id="2202" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="2218" Siniflar="106" Ders="2175" Ogretmenler="80">
            <Kart Yerlesim="1901,1902" Saat="2" id="2219" Derslikler=""/>
            <Kart Yerlesim="12,17" Saat="2" id="2220" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="2239" Siniflar="111" Ders="2175" Ogretmenler="84">
            <Kart Yerlesim="1913,1914" Saat="2" id="2240" Derslikler=""/>
            <Kart Yerlesim="1927,1928" Saat="2" id="2241" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="2268" Siniflar="119" Ders="2257" Ogretmenler="89">
            <Kart Yerlesim="1911,1912" Saat="2" id="2269" Derslikler=""/>
            <Kart Yerlesim="1900" Saat="1" id="2270" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="2277" Siniflar="1967" Ders="2257" Ogretmenler="91">
            <Kart Yerlesim="22,27" Saat="2" id="2278" Derslikler=""/>
            <Kart Yerlesim="1906" Saat="1" id="2279" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="2292" Siniflar="106" Ders="2257" Ogretmenler="90">
            <Kart Yerlesim="37,42" Saat="2" id="2293" Derslikler=""/>
            <Kart Yerlesim="1906" Saat="1" id="2294" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="2311" Siniflar="111" Ders="2310" Ogretmenler="89">
            <Kart Yerlesim="27,32" Saat="2" id="2312" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="2331" Siniflar="119" Ders="2321" Ogretmenler="86">
            <Kart Yerlesim="1908,1909" Saat="2" id="2332" Derslikler=""/>
            <Kart Yerlesim="22" Saat="1" id="2333" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="2340" Siniflar="1967" Ders="2321" Ogretmenler="86">
            <Kart Yerlesim="1929,1930" Saat="2" id="2341" Derslikler=""/>
            <Kart Yerlesim="1919" Saat="1" id="2342" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="2355" Siniflar="106" Ders="2321" Ogretmenler="88">
            <Kart Yerlesim="1913,1914" Saat="2" id="2356" Derslikler=""/>
            <Kart Yerlesim="1925,1926" Saat="2" id="4437" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="2371" Siniflar="111" Ders="2321" Ogretmenler="85">
            <Kart Yerlesim="37,42" Saat="2" id="2372" Derslikler=""/>
            <Kart Yerlesim="1929,1930" Saat="2" id="4625" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="2396" Siniflar="119" Ders="2389" Ogretmenler="93">
            <Kart Yerlesim="1926,1927" Saat="2" id="2985" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="2402" Siniflar="1967" Ders="2389" Ogretmenler="93">
            <Kart Yerlesim="1904,1905" Saat="2" id="2403" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="2412" Siniflar="106" Ders="2389" Ogretmenler="93">
            <Kart Yerlesim="1908,1909" Saat="2" id="2413" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="2422" Siniflar="111" Ders="2389" Ogretmenler="93">
            <Kart Yerlesim="1900,1901" Saat="2" id="4626" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="2441" Siniflar="119" Ders="2434" Ogretmenler="806">
            <Kart Yerlesim="1928" Saat="1" id="2442" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="2447" Siniflar="1967" Ders="2434" Ogretmenler="806">
            <Kart Yerlesim="1908" Saat="1" id="2448" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="2457" Siniflar="106" Ders="2434" Ogretmenler="806">
            <Kart Yerlesim="1924" Saat="1" id="2458" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="2467" Siniflar="111" Ders="2434" Ogretmenler="806">
            <Kart Yerlesim="12" Saat="1" id="2468" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="2486" Siniflar="119" Ders="2479" Ogretmenler="97">
            <Kart Yerlesim="1913,1914" Saat="2" id="2487" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="2492" Siniflar="1967" Ders="2479" Ogretmenler="97">
            <Kart Yerlesim="1926,1927" Saat="2" id="2493" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="2502" Siniflar="106" Ders="2479" Ogretmenler="96">
            <Kart Yerlesim="27,32" Saat="2" id="2503" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="2512" Siniflar="111" Ders="2479" Ogretmenler="97">
            <Kart Yerlesim="1908,1909" Saat="2" id="2513" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="2531" Siniflar="119" Ders="2524" Ogretmenler="95">
            <Kart Yerlesim="1920" Saat="1" id="2532" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="2537" Siniflar="1967" Ders="2524" Ogretmenler="95">
            <Kart Yerlesim="1928" Saat="1" id="2538" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="2547" Siniflar="106" Ders="2524" Ogretmenler="95">
            <Kart Yerlesim="1905" Saat="1" id="2548" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="2557" Siniflar="111" Ders="2524" Ogretmenler="95">
            <Kart Yerlesim="1906" Saat="1" id="2558" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="2576" Siniflar="119" Ders="2569" Ogretmenler="99">
            <Kart Yerlesim="1903,1904" Saat="2" id="2577" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="2582" Siniflar="1967" Ders="2569" Ogretmenler="99">
            <Kart Yerlesim="1900,1901" Saat="2" id="2583" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="2595" Siniflar="106" Ders="2594" Ogretmenler="1563">
            <Kart Yerlesim="1917,1918" Saat="2" id="2596" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="2605" Siniflar="111" Ders="2594" Ogretmenler="1563">
            <Kart Yerlesim="1902,1903" Saat="2" id="2606" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="2619" Siniflar="111" Ders="2618" Ogretmenler="85">
            <Kart Yerlesim="1926" Saat="1" id="2620" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="2720" Siniflar="111" Ders="4794" Ogretmenler="84">
            <Kart Yerlesim="1916,1917" Saat="2" id="2721" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="2730" Siniflar="111" Ders="4795" Ogretmenler="71">
            <Kart Yerlesim="1921,1922" Saat="2" id="2731" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="2740" Siniflar="111" Ders="2649" Ogretmenler="75">
            <Kart Yerlesim="1918,1919" Saat="2" id="2741" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="2752" Siniflar="119" Ders="2644" Ogretmenler="72">
            <Kart Yerlesim="1921,1922" Saat="2" id="2753" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="2770" Siniflar="119" Ders="2649" Ogretmenler="76">
            <Kart Yerlesim="1917,1918" Saat="2" id="2771" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="2776" Siniflar="119" Ders="2648" Ogretmenler="91">
            <Kart Yerlesim="1919" Saat="1" id="3220" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="3186" Siniflar="119" Ders="2618" Ogretmenler="81">
            <Kart Yerlesim="1916" Saat="1" id="3187" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="3200" Siniflar="1967" Ders="2618" Ogretmenler="76">
            <Kart Yerlesim="42" Saat="1" id="3201" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="3210" Siniflar="106" Ders="2618" Ogretmenler="90">
            <Kart Yerlesim="1900" Saat="1" id="3211" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="3445" Siniflar="3427" Ders="2837" Ogretmenler="85">
            <Kart Yerlesim="1923,1950" Saat="2" id="3446" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="3473" Siniflar="3428" Ders="2837" Ogretmenler="85">
            <Kart Yerlesim="1839,1947" Saat="2" id="3474" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="3476" Siniflar="3428" Ders="2837" Ogretmenler="86">
            <Kart Yerlesim="1907,1948" Saat="2" id="3477" Derslikler=""/>
            <Kart Yerlesim="1931" Saat="1" id="4877" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="3479" Siniflar="3427" Ders="2837" Ogretmenler="87">
            <Kart Yerlesim="1839,1947" Saat="2" id="4875" Derslikler=""/>
            <Kart Yerlesim="1949" Saat="1" id="4876" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4077" Siniflar="120" Ders="1972" Ogretmenler="68">
            <Kart Yerlesim="12,17" Saat="2" id="4078" Derslikler=""/>
            <Kart Yerlesim="1927,1928" Saat="2" id="4079" Derslikler=""/>
            <Kart Yerlesim="1909,1910" Saat="2" id="4614" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4082" Siniflar="120" Ders="2070" Ogretmenler="75">
            <Kart Yerlesim="1929,1930" Saat="2" id="4083" Derslikler=""/>
            <Kart Yerlesim="1900,1901" Saat="2" id="4084" Derslikler=""/>
            <Kart Yerlesim="1908" Saat="1" id="4085" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4086" Siniflar="117" Ders="2175" Ogretmenler="80">
            <Kart Yerlesim="1913,1914" Saat="2" id="4087" Derslikler=""/>
            <Kart Yerlesim="1921,1922" Saat="2" id="4088" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4089" Siniflar="120" Ders="2257" Ogretmenler="89">
            <Kart Yerlesim="1925,1926" Saat="2" id="4090" Derslikler=""/>
            <Kart Yerlesim="1906" Saat="1" id="4091" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4092" Siniflar="120" Ders="2321" Ogretmenler="86">
            <Kart Yerlesim="32,37" Saat="2" id="4093" Derslikler=""/>
            <Kart Yerlesim="1924" Saat="1" id="4094" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4095" Siniflar="120" Ders="2389" Ogretmenler="93">
            <Kart Yerlesim="1913,1914" Saat="2" id="4096" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4097" Siniflar="120" Ders="2434" Ogretmenler="806">
            <Kart Yerlesim="1905" Saat="1" id="4098" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4099" Siniflar="120" Ders="2479" Ogretmenler="96">
            <Kart Yerlesim="1903,1904" Saat="2" id="4100" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4101" Siniflar="120" Ders="2524" Ogretmenler="95">
            <Kart Yerlesim="42" Saat="1" id="4102" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4103" Siniflar="120" Ders="2569" Ogretmenler="99">
            <Kart Yerlesim="1918,1919" Saat="2" id="4104" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4105" Siniflar="120" Ders="2644" Ogretmenler="72">
            <Kart Yerlesim="1916,1917" Saat="2" id="4106" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4109" Siniflar="120" Ders="2648" Ogretmenler="91">
            <Kart Yerlesim="1922" Saat="1" id="4110" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4111" Siniflar="120" Ders="2618" Ogretmenler="68">
            <Kart Yerlesim="1902" Saat="1" id="4112" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4113" Siniflar="1966" Ders="1972" Ogretmenler="68">
            <Kart Yerlesim="37,42" Saat="2" id="4114" Derslikler=""/>
            <Kart Yerlesim="1924,1925" Saat="2" id="4115" Derslikler=""/>
            <Kart Yerlesim="1905,1906" Saat="2" id="4615" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4118" Siniflar="1966" Ders="2070" Ogretmenler="3042">
            <Kart Yerlesim="1929,1930" Saat="2" id="4119" Derslikler=""/>
            <Kart Yerlesim="1903,1904" Saat="2" id="4120" Derslikler=""/>
            <Kart Yerlesim="1910" Saat="1" id="4121" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4122" Siniflar="1966" Ders="2175" Ogretmenler="82">
            <Kart Yerlesim="1911,1912" Saat="2" id="4123" Derslikler=""/>
            <Kart Yerlesim="1927,1928" Saat="2" id="4124" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4125" Siniflar="1966" Ders="2257" Ogretmenler="91">
            <Kart Yerlesim="12,17" Saat="2" id="4126" Derslikler=""/>
            <Kart Yerlesim="1902" Saat="1" id="4127" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4128" Siniflar="1966" Ders="2321" Ogretmenler="87">
            <Kart Yerlesim="1900,1901" Saat="2" id="4129" Derslikler=""/>
            <Kart Yerlesim="1926" Saat="1" id="4130" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4131" Siniflar="1966" Ders="2389" Ogretmenler="93">
            <Kart Yerlesim="22,27" Saat="2" id="4132" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4133" Siniflar="1966" Ders="2434" Ogretmenler="806">
            <Kart Yerlesim="32" Saat="1" id="4134" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4135" Siniflar="1966" Ders="2479" Ogretmenler="96">
            <Kart Yerlesim="1913,1914" Saat="2" id="4136" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4137" Siniflar="1966" Ders="2524" Ogretmenler="95">
            <Kart Yerlesim="1916" Saat="1" id="4138" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4139" Siniflar="1966" Ders="2569" Ogretmenler="99">
            <Kart Yerlesim="1908,1909" Saat="2" id="4140" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4141" Siniflar="1966" Ders="2644" Ogretmenler="72">
            <Kart Yerlesim="1919,1920" Saat="2" id="4142" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4145" Siniflar="1966" Ders="2648" Ogretmenler="91">
            <Kart Yerlesim="1921" Saat="1" id="4146" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4147" Siniflar="1966" Ders="2618" Ogretmenler="87">
            <Kart Yerlesim="1922" Saat="1" id="4148" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4149" Siniflar="116" Ders="1972" Ogretmenler="74">
            <Kart Yerlesim="12,17" Saat="2" id="4150" Derslikler=""/>
            <Kart Yerlesim="1913,1914" Saat="2" id="4151" Derslikler=""/>
            <Kart Yerlesim="1917,1918" Saat="2" id="4616" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4154" Siniflar="116" Ders="2070" Ogretmenler="3042">
            <Kart Yerlesim="1905,1906" Saat="2" id="4155" Derslikler=""/>
            <Kart Yerlesim="32,37" Saat="2" id="4156" Derslikler=""/>
            <Kart Yerlesim="1909" Saat="1" id="4157" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4158" Siniflar="116" Ders="2175" Ogretmenler="82">
            <Kart Yerlesim="1924,1925" Saat="2" id="4159" Derslikler=""/>
            <Kart Yerlesim="1900,1901" Saat="2" id="4160" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4161" Siniflar="116" Ders="2257" Ogretmenler="91">
            <Kart Yerlesim="1926,1927" Saat="2" id="4162" Derslikler=""/>
            <Kart Yerlesim="42" Saat="1" id="4163" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4164" Siniflar="116" Ders="2321" Ogretmenler="87">
            <Kart Yerlesim="1928,1929" Saat="2" id="4165" Derslikler=""/>
            <Kart Yerlesim="1908" Saat="1" id="4166" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4167" Siniflar="116" Ders="2389" Ogretmenler="93">
            <Kart Yerlesim="1902,1903" Saat="2" id="4168" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4169" Siniflar="116" Ders="2434" Ogretmenler="806">
            <Kart Yerlesim="1930" Saat="1" id="4170" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4171" Siniflar="116" Ders="2479" Ogretmenler="96">
            <Kart Yerlesim="1911,1912" Saat="2" id="4172" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4173" Siniflar="116" Ders="2524" Ogretmenler="95">
            <Kart Yerlesim="1904" Saat="1" id="4174" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4175" Siniflar="116" Ders="2569" Ogretmenler="99">
            <Kart Yerlesim="22,27" Saat="2" id="4176" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4177" Siniflar="116" Ders="2644" Ogretmenler="68">
            <Kart Yerlesim="1921,1922" Saat="2" id="4178" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4181" Siniflar="116" Ders="2648" Ogretmenler="91">
            <Kart Yerlesim="1916" Saat="1" id="4182" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4183" Siniflar="116" Ders="2618" Ogretmenler="74">
            <Kart Yerlesim="1910" Saat="1" id="4184" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4185" Siniflar="117" Ders="1972" Ogretmenler="73">
            <Kart Yerlesim="1903,1904" Saat="2" id="4186" Derslikler=""/>
            <Kart Yerlesim="37,42" Saat="2" id="4187" Derslikler=""/>
            <Kart Yerlesim="1924,1925" Saat="2" id="4617" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4190" Siniflar="117" Ders="2070" Ogretmenler="77">
            <Kart Yerlesim="1905,1906" Saat="2" id="4191" Derslikler=""/>
            <Kart Yerlesim="1911,1912" Saat="2" id="4192" Derslikler=""/>
            <Kart Yerlesim="1926" Saat="1" id="4193" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4197" Siniflar="117" Ders="2257" Ogretmenler="91">
            <Kart Yerlesim="1929,1930" Saat="2" id="4198" Derslikler=""/>
            <Kart Yerlesim="1900" Saat="1" id="4199" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4200" Siniflar="117" Ders="2321" Ogretmenler="87">
            <Kart Yerlesim="22,27" Saat="2" id="4201" Derslikler=""/>
            <Kart Yerlesim="1902" Saat="1" id="4202" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4203" Siniflar="117" Ders="2389" Ogretmenler="93">
            <Kart Yerlesim="12,17" Saat="2" id="4204" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4205" Siniflar="117" Ders="2434" Ogretmenler="806">
            <Kart Yerlesim="1901" Saat="1" id="4206" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4207" Siniflar="117" Ders="2479" Ogretmenler="96">
            <Kart Yerlesim="1908,1909" Saat="2" id="4208" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4209" Siniflar="117" Ders="2524" Ogretmenler="95">
            <Kart Yerlesim="1910" Saat="1" id="4210" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4211" Siniflar="117" Ders="2569" Ogretmenler="99">
            <Kart Yerlesim="1927,1928" Saat="2" id="4212" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4213" Siniflar="117" Ders="2644" Ogretmenler="68">
            <Kart Yerlesim="1918,1919" Saat="2" id="4214" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4217" Siniflar="117" Ders="2648" Ogretmenler="91">
            <Kart Yerlesim="1920" Saat="1" id="4218" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4219" Siniflar="117" Ders="2618" Ogretmenler="77">
            <Kart Yerlesim="32" Saat="1" id="4220" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4221" Siniflar="118" Ders="1972" Ogretmenler="74">
            <Kart Yerlesim="1908,1909" Saat="2" id="4222" Derslikler=""/>
            <Kart Yerlesim="1927,1928" Saat="2" id="4223" Derslikler=""/>
            <Kart Yerlesim="1903,1904" Saat="2" id="4618" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4226" Siniflar="118" Ders="2070" Ogretmenler="3042">
            <Kart Yerlesim="1925,1926" Saat="2" id="4227" Derslikler=""/>
            <Kart Yerlesim="1912,1913" Saat="2" id="4228" Derslikler=""/>
            <Kart Yerlesim="42" Saat="1" id="4229" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4230" Siniflar="118" Ders="2175" Ogretmenler="80">
            <Kart Yerlesim="1929,1930" Saat="2" id="4231" Derslikler=""/>
            <Kart Yerlesim="27,32" Saat="2" id="4232" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4233" Siniflar="118" Ders="2257" Ogretmenler="89">
            <Kart Yerlesim="1919,1920" Saat="2" id="4234" Derslikler=""/>
            <Kart Yerlesim="1902" Saat="1" id="4235" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4236" Siniflar="118" Ders="2321" Ogretmenler="87">
            <Kart Yerlesim="12,17" Saat="2" id="4237" Derslikler=""/>
            <Kart Yerlesim="1914" Saat="1" id="4238" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4239" Siniflar="118" Ders="2389" Ogretmenler="3426">
            <Kart Yerlesim="1910,1911" Saat="2" id="4240" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4241" Siniflar="118" Ders="2434" Ogretmenler="806">
            <Kart Yerlesim="37" Saat="1" id="4242" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4243" Siniflar="118" Ders="2479" Ogretmenler="96">
            <Kart Yerlesim="1900,1901" Saat="2" id="4244" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4245" Siniflar="118" Ders="2524" Ogretmenler="95">
            <Kart Yerlesim="22" Saat="1" id="4246" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4247" Siniflar="118" Ders="2569" Ogretmenler="99">
            <Kart Yerlesim="1905,1906" Saat="2" id="4248" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4249" Siniflar="118" Ders="2644" Ogretmenler="68">
            <Kart Yerlesim="1916,1917" Saat="2" id="4250" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4253" Siniflar="118" Ders="2648" Ogretmenler="91">
            <Kart Yerlesim="1918" Saat="1" id="4254" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4255" Siniflar="118" Ders="2618" Ogretmenler="89">
            <Kart Yerlesim="1924" Saat="1" id="4256" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4257" Siniflar="1968" Ders="1972" Ogretmenler="72">
            <Kart Yerlesim="1900,1901" Saat="2" id="4258" Derslikler=""/>
            <Kart Yerlesim="1911,1912" Saat="2" id="4259" Derslikler=""/>
            <Kart Yerlesim="1924,1925" Saat="2" id="4623" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4262" Siniflar="1968" Ders="2070" Ogretmenler="76">
            <Kart Yerlesim="1926,1927" Saat="2" id="4263" Derslikler=""/>
            <Kart Yerlesim="1913,1914" Saat="2" id="4264" Derslikler=""/>
            <Kart Yerlesim="22" Saat="1" id="4265" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4266" Siniflar="1968" Ders="2175" Ogretmenler="81">
            <Kart Yerlesim="12,17" Saat="2" id="4267" Derslikler=""/>
            <Kart Yerlesim="1905,1906" Saat="2" id="4268" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4269" Siniflar="1968" Ders="2257" Ogretmenler="1932">
            <Kart Yerlesim="27,32" Saat="2" id="4270" Derslikler=""/>
            <Kart Yerlesim="1928" Saat="1" id="4271" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4272" Siniflar="1968" Ders="2321" Ogretmenler="86">
            <Kart Yerlesim="1921,1922" Saat="2" id="4273" Derslikler=""/>
            <Kart Yerlesim="1903" Saat="1" id="4274" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4275" Siniflar="1968" Ders="2389" Ogretmenler="3426">
            <Kart Yerlesim="1908,1909" Saat="2" id="4276" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4277" Siniflar="1968" Ders="2434" Ogretmenler="806">
            <Kart Yerlesim="1910" Saat="1" id="4278" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4279" Siniflar="1968" Ders="2479" Ogretmenler="97">
            <Kart Yerlesim="37,42" Saat="2" id="4280" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4281" Siniflar="1968" Ders="2524" Ogretmenler="95">
            <Kart Yerlesim="1902" Saat="1" id="4282" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4283" Siniflar="1968" Ders="2569" Ogretmenler="99">
            <Kart Yerlesim="1929,1930" Saat="2" id="4284" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4289" Siniflar="1968" Ders="2618" Ogretmenler="72">
            <Kart Yerlesim="1904" Saat="1" id="4290" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4293" Siniflar="1969" Ders="1972" Ogretmenler="69">
            <Kart Yerlesim="1912,1913" Saat="2" id="4294" Derslikler=""/>
            <Kart Yerlesim="1903,1904" Saat="2" id="4295" Derslikler=""/>
            <Kart Yerlesim="1920,1921" Saat="2" id="4622" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4298" Siniflar="1969" Ders="2070" Ogretmenler="76">
            <Kart Yerlesim="1905,1906" Saat="2" id="4299" Derslikler=""/>
            <Kart Yerlesim="1929,1930" Saat="2" id="4300" Derslikler=""/>
            <Kart Yerlesim="1908" Saat="1" id="4301" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4305" Siniflar="1969" Ders="2257" Ogretmenler="91">
            <Kart Yerlesim="32,37" Saat="2" id="4306" Derslikler=""/>
            <Kart Yerlesim="1924" Saat="1" id="4307" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4308" Siniflar="1969" Ders="2321" Ogretmenler="86">
            <Kart Yerlesim="1925,1926" Saat="2" id="4309" Derslikler=""/>
            <Kart Yerlesim="42" Saat="1" id="4310" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4311" Siniflar="1969" Ders="2389" Ogretmenler="3426">
            <Kart Yerlesim="22,27" Saat="2" id="4312" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4313" Siniflar="1969" Ders="2434" Ogretmenler="806">
            <Kart Yerlesim="1914" Saat="1" id="4314" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4315" Siniflar="1969" Ders="2479" Ogretmenler="97">
            <Kart Yerlesim="1900,1901" Saat="2" id="4316" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4317" Siniflar="1969" Ders="2524" Ogretmenler="95">
            <Kart Yerlesim="1909" Saat="1" id="4318" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4319" Siniflar="1969" Ders="2569" Ogretmenler="99">
            <Kart Yerlesim="1910,1911" Saat="2" id="4320" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4321" Siniflar="1969" Ders="4732" Ogretmenler="73">
            <Kart Yerlesim="1922" Saat="1" id="4322" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4323" Siniflar="1969" Ders="2646" Ogretmenler="82">
            <Kart Yerlesim="1918,1919" Saat="2" id="4324" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4325" Siniflar="1969" Ders="2618" Ogretmenler="81">
            <Kart Yerlesim="1902" Saat="1" id="4326" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4327" Siniflar="1969" Ders="2648" Ogretmenler="1932">
            <Kart Yerlesim="1916,1917" Saat="2" id="4328" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4329" Siniflar="1970" Ders="1972" Ogretmenler="69">
            <Kart Yerlesim="1901,1902" Saat="2" id="4330" Derslikler=""/>
            <Kart Yerlesim="1924,1925" Saat="2" id="4331" Derslikler=""/>
            <Kart Yerlesim="22,27" Saat="2" id="4621" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4334" Siniflar="1970" Ders="2070" Ogretmenler="4864">
            <Kart Yerlesim="1908,1909" Saat="2" id="4335" Derslikler=""/>
            <Kart Yerlesim="1926,1927" Saat="2" id="4336" Derslikler=""/>
            <Kart Yerlesim="1900" Saat="1" id="4337" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4338" Siniflar="1970" Ders="2175" Ogretmenler="83">
            <Kart Yerlesim="32,37" Saat="2" id="4339" Derslikler=""/>
            <Kart Yerlesim="1905,1906" Saat="2" id="4340" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4341" Siniflar="1970" Ders="2257" Ogretmenler="1932">
            <Kart Yerlesim="1911,1912" Saat="2" id="4342" Derslikler=""/>
            <Kart Yerlesim="1930" Saat="1" id="4343" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4344" Siniflar="1970" Ders="2321" Ogretmenler="86">
            <Kart Yerlesim="12,17" Saat="2" id="4345" Derslikler=""/>
            <Kart Yerlesim="1918" Saat="1" id="4346" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4347" Siniflar="1970" Ders="2389" Ogretmenler="3426">
            <Kart Yerlesim="1928,1929" Saat="2" id="4348" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4349" Siniflar="1970" Ders="2434" Ogretmenler="806">
            <Kart Yerlesim="42" Saat="1" id="4350" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4351" Siniflar="1970" Ders="2479" Ogretmenler="97">
            <Kart Yerlesim="1903,1904" Saat="2" id="4352" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4353" Siniflar="1970" Ders="2524" Ogretmenler="95">
            <Kart Yerlesim="1922" Saat="1" id="4354" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4355" Siniflar="1970" Ders="2569" Ogretmenler="99">
            <Kart Yerlesim="1913,1914" Saat="2" id="4356" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4361" Siniflar="1970" Ders="2618" Ogretmenler="69">
            <Kart Yerlesim="1910" Saat="1" id="4362" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4365" Siniflar="1971" Ders="1972" Ogretmenler="69">
            <Kart Yerlesim="12,17" Saat="2" id="4366" Derslikler=""/>
            <Kart Yerlesim="1929,1930" Saat="2" id="4367" Derslikler=""/>
            <Kart Yerlesim="1908,1909" Saat="2" id="4619" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4370" Siniflar="1971" Ders="2070" Ogretmenler="4864">
            <Kart Yerlesim="22,27" Saat="2" id="4371" Derslikler=""/>
            <Kart Yerlesim="1924,1925" Saat="2" id="4372" Derslikler=""/>
            <Kart Yerlesim="1918" Saat="1" id="4373" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4374" Siniflar="1971" Ders="2175" Ogretmenler="83">
            <Kart Yerlesim="1902,1903" Saat="2" id="4375" Derslikler=""/>
            <Kart Yerlesim="1913,1914" Saat="2" id="4376" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4377" Siniflar="1971" Ders="2257" Ogretmenler="1932">
            <Kart Yerlesim="1900,1901" Saat="2" id="4378" Derslikler=""/>
            <Kart Yerlesim="42" Saat="1" id="4379" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4380" Siniflar="1971" Ders="2321" Ogretmenler="85">
            <Kart Yerlesim="1904,1905" Saat="2" id="4381" Derslikler=""/>
            <Kart Yerlesim="1928" Saat="1" id="4382" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4383" Siniflar="1971" Ders="2389" Ogretmenler="3426">
            <Kart Yerlesim="1926,1927" Saat="2" id="4384" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4385" Siniflar="1971" Ders="2434" Ogretmenler="806">
            <Kart Yerlesim="1906" Saat="1" id="4386" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4387" Siniflar="1971" Ders="2479" Ogretmenler="97">
            <Kart Yerlesim="1910,1911" Saat="2" id="4388" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4389" Siniflar="1971" Ders="2524" Ogretmenler="95">
            <Kart Yerlesim="1912" Saat="1" id="4390" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4391" Siniflar="1971" Ders="2569" Ogretmenler="99">
            <Kart Yerlesim="32,37" Saat="2" id="4392" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4393" Siniflar="1971" Ders="2646" Ogretmenler="83">
            <Kart Yerlesim="1919,1920" Saat="2" id="4394" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4395" Siniflar="1971" Ders="4730" Ogretmenler="93">
            <Kart Yerlesim="1921,1922" Saat="2" id="4396" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4397" Siniflar="1971" Ders="2618" Ogretmenler="4864">
            <Kart Yerlesim="1917" Saat="1" id="4398" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4399" Siniflar="1971" Ders="4732" Ogretmenler="74">
            <Kart Yerlesim="1916" Saat="1" id="4400" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4401" Siniflar="3285" Ders="1972" Ogretmenler="69">
            <Kart Yerlesim="32,37" Saat="2" id="4402" Derslikler=""/>
            <Kart Yerlesim="1927,1928" Saat="2" id="4403" Derslikler=""/>
            <Kart Yerlesim="1905,1906" Saat="2" id="4620" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4406" Siniflar="3285" Ders="2070" Ogretmenler="3042">
            <Kart Yerlesim="22,27" Saat="2" id="4407" Derslikler=""/>
            <Kart Yerlesim="1901,1902" Saat="2" id="4408" Derslikler=""/>
            <Kart Yerlesim="1914" Saat="1" id="4409" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4410" Siniflar="3285" Ders="2175" Ogretmenler="81">
            <Kart Yerlesim="1909,1910" Saat="2" id="4411" Derslikler=""/>
            <Kart Yerlesim="1903,1904" Saat="2" id="4412" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4413" Siniflar="3285" Ders="2257" Ogretmenler="1932">
            <Kart Yerlesim="12,17" Saat="2" id="4414" Derslikler=""/>
            <Kart Yerlesim="1908" Saat="1" id="4415" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4416" Siniflar="3285" Ders="2321" Ogretmenler="804">
            <Kart Yerlesim="1924,1925" Saat="2" id="4417" Derslikler=""/>
            <Kart Yerlesim="42" Saat="1" id="4418" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4419" Siniflar="3285" Ders="2389" Ogretmenler="3426">
            <Kart Yerlesim="1912,1913" Saat="2" id="4420" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4421" Siniflar="3285" Ders="2434" Ogretmenler="806">
            <Kart Yerlesim="1926" Saat="1" id="4422" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4423" Siniflar="3285" Ders="2479" Ogretmenler="97">
            <Kart Yerlesim="1929,1930" Saat="2" id="4424" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4425" Siniflar="3285" Ders="2524" Ogretmenler="95">
            <Kart Yerlesim="1900" Saat="1" id="4426" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4427" Siniflar="3285" Ders="2569" Ogretmenler="99">
            <Kart Yerlesim="1916,1917" Saat="2" id="4428" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4429" Siniflar="3285" Ders="2646" Ogretmenler="81">
            <Kart Yerlesim="1918,1919" Saat="2" id="4430" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4431" Siniflar="3285" Ders="4732" Ogretmenler="74">
            <Kart Yerlesim="1922" Saat="1" id="4432" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4433" Siniflar="3285" Ders="2618" Ogretmenler="3042">
            <Kart Yerlesim="1911" Saat="1" id="4434" Derslikler=""/>
        </TanimliDers>
        <TanimliDers id="4435" Siniflar, Ders, Ogretmenler.../>
    </TanimliDersler>
</DersProgrami>""")

