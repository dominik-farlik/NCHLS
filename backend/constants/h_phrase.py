from enum import IntEnum
from typing import FrozenSet


class HPhrase(IntEnum):
    H200 = 200
    H201 = 201
    H202 = 202
    H203 = 203
    H204 = 204
    H205 = 205
    H206 = 206
    H207 = 207
    H208 = 208
    H220 = 220
    H221 = 221
    H222 = 222
    H223 = 223
    H224 = 224
    H225 = 225
    H226 = 226
    H228 = 228
    H229 = 229
    H230 = 230
    H231 = 231
    H232 = 232
    H240 = 240
    H241 = 241
    H242 = 242
    H250 = 250
    H251 = 251
    H252 = 252
    H260 = 260
    H261 = 261
    H270 = 270
    H271 = 271
    H272 = 272
    H280 = 280
    H281 = 281
    H290 = 290
    H300 = 300
    H301 = 301
    H302 = 302
    H304 = 304
    H310 = 310
    H311 = 311
    H312 = 312
    H314 = 314
    H315 = 315
    H317 = 317
    H318 = 318
    H319 = 319
    H330 = 330
    H331 = 331
    H332 = 332
    H334 = 334
    H335 = 335
    H336 = 336
    H340 = 340
    H341 = 341
    H350 = 350
    H351 = 351
    H360 = 360
    H361 = 361
    H362 = 362
    H370 = 370
    H371 = 371
    H372 = 372
    H373 = 373
    H400 = 400
    H410 = 410
    H411 = 411
    H412 = 412
    H413 = 413
    H420 = 420

    @property
    def description(self) -> str:
        return {
            200: "Nestabilní výbušnina.",
            201: "Výbušnina; nebezpečí masivního výbuchu.",
            202: "Výbušnina; vážné nebezpečí zasažení částicemi.",
            203: "Výbušnina; nebezpečí požáru, tlakové vlny nebo zasažení částicemi.",
            204: "Nebezpečí požáru nebo zasažení částicemi.",
            205: "Při požáru může způsobit masivní výbuch.",
            206: "Nebezpečí požáru, tlakové vlny nebo zasažení částicemi; zvýšené nebezpečí výbuchu, sníží-li se objem znecitlivujícího prostředku.",
            207: "Nebezpečí požáru nebo zasažení částicemi; zvýšené nebezpečí výbuchu, sníží-li se objem znecitlivujícího prostředku.",
            208: "Nebezpečí požáru; zvýšené nebezpečí výbuchu, sníží-li se objem znecitlivujícího prostředku.",
            220: "Extrémně hořlavý plyn.",
            221: "Hořlavý plyn.",
            222: "Extrémně hořlavý aerosol.",
            223: "Hořlavý aerosol.",
            224: "Extrémně hořlavá kapalina a páry.",
            225: "Vysoce hořlavá kapalina a páry.",
            226: "Hořlavá kapalina a páry.",
            228: "Hořlavá tuhá látka.",
            229: "Nádoba je pod tlakem: při zahřívání se může roztrhnout.",
            230: "Může reagovat výbušně i bez přítomnosti vzduchu.",
            231: "Při zvýšeném tlaku a/nebo teplotě může reagovat výbušně i bez přítomnosti vzduchu",
            232: "Při styku se vzduchem se může samovolně vznítit.",
            240: "Zahřívání může způsobit výbuch.",
            241: "Zahřívání může způsobit požár nebo výbuch.",
            242: "Zahřívání může způsobit požár.",
            250: "Při styku se vzduchem se samovolně vznítí.",
            251: "Samovolně se zahřívá: může se vznítit.",
            252: "Ve velkém množství se samovolně zahřívá; může se vznítit.",
            260: "Při styku s vodou uvolňuje hořlavé plyny, které se mohou samovolně vznítit.",
            261: "Při styku s vodou uvolňuje hořlavé plyny.",
            270: "Může způsobit nebo zesílit požár; oxidant.",
            271: "Může způsobit požár nebo výbuch; silný oxidant.",
            272: "Může zesílit požár; oxidant.",
            280: "Obsahuje plyn pod tlakem; při zahřívání může vybuchnout.",
            281: "Obsahuje zchlazený plyn; může způsobit omrzliny nebo poškození chladem.",
            290: "Může být korozivní pro kovy.",
            300: "Při požití může způsobit smrt.",
            301: "Toxický při požití.",
            302: "Zdraví škodlivý při požití.",
            304: "Při požití a vniknutí do dýchacích cest může způsobit smrt.",
            310: "Při styku s kůží může způsobit smrt.",
            311: "Toxický při styku s kůží.",
            312: "Zdraví škodlivý při styku s kůží.",
            314: "Způsobuje těžké poleptání kůže a poškození očí.",
            315: "Dráždí kůži.",
            317: "Může vyvolat alergickou kožní reakci.",
            318: "Způsobuje vážné poškození očí.",
            319: "Způsobuje vážné podráždění očí.",
            330: "Při vdechování může způsobit smrt.",
            331: "Toxický při vdechování.",
            332: "Zdraví škodlivý při vdechování.",
            334: "Při vdechování může vyvolat příznaky alergie nebo astmatu nebo dýchací potíže.",
            335: "Může způsobit podráždění dýchacích cest.",
            336: "Může způsobit ospalost nebo závratě.",
            340: "Může vyvolat genetické poškození <uveďte cestu expozice, je-li přesvědčivě prokázáno, že ostatní cesty expozice nejsou nebezpečné>",
            341: "Podezření na genetické poškození <uveďte cestu expozice, je-li přesvědčivě prokázáno, že ostatní cesty expozice nejsou nebezpečné>.",
            350: "Může vyvolat rakovinu <uveďte cestu expozice, je-li přesvědčivě prokázáno, že ostatní cesty expozice nejsou nebezpečné>.",
            351: "Podezření na vyvolání rakoviny <uveďte cestu expozice, je-li přesvědčivě prokázáno, že ostatní cesty expozice nejsou nebezpečné>.",
            360: "Může poškodit reprodukční schopnost nebo plod v těle matky <uveďte specifický účinek, je-li znám> <uveďte cestu expozice, je-li přesvědčivě prokázáno, že ostatní cesty expozice nejsou nebezpečné>.",
            361: "Podezření na poškození reprodukční schopnosti nebo plodu v těle matky <uveďte specifický účinek, je-li znám> <uveďte cestu expozice, je-li přesvědčivě prokázáno, že ostatní cesty expozice nejsou nebezpečné>.",
            362: "Může poškodit kojence prostřednictvím mateřského mléka.",
            370: "Způsobuje poškození orgánů <nebo uvést všechny postižené orgány, jsou-li známy> <uveďte cestu expozice, je-li přesvědčivě prokázáno, že ostatní cesty expozice nejsou nebezpečné>.",
            371: "Může způsobit poškození orgánů <nebo uvést všechny postižené orgány, jsou-li známy> <uveďte cestu expozice, je-li přesvědčivě prokázáno, že ostatní cesty expozice nejsou nebezpečné>.",
            372: "Způsobuje poškození orgánů <nebo uvést všechny postižené orgány, jsou-li známy> při prodloužené nebo opakované expozici <uveďte cestu expozice, je-li přesvědčivě prokázáno, že ostatní cesty expozice nejsou nebezpečné>.",
            373: "Může způsobit poškození orgánů <nebo uvést všechny postižené orgány, jsou-li známy> při prodloužené nebo opakované expozici <uveďte cestu expozice, je-li přesvědčivě prokázáno, že ostatní cesty expozice nejsou nebezpečné>.",
            400: "Vysoce toxický pro vodní organismy.",
            410: "Vysoce toxický pro vodní organismy, s dlouhodobými účinky.",
            411: "Toxický pro vodní organismy, s dlouhodobými účinky.",
            412: "Škodlivý pro vodní organismy, s dlouhodobými účinky.",
            413: "Může vyvolat dlouhodobé škodlivé účinky pro vodní organismy.",
            420: "Poškozuje veřejné zdraví a životní prostředí tím, že ničí ozon ve svrchních vrstvách atmosféry.",
        }[self.value]


H_COMBINATIONS: dict[FrozenSet[int], str] = {
    frozenset([300, 310]): "Při požití nebo při styku s kůží může způsobit smrt.",
    frozenset([300, 330]): "Při požití nebo při vdechování může způsobit smrt.",
    frozenset([310, 330]): "Při styku s kůží nebo při vdechování může způsobit smrt.",
    frozenset(
        [300, 310, 330]
    ): "Při požití, při styku s kůží nebo při vdechování může způsobit smrt.",
    frozenset([301, 311]): "Toxický při požití nebo při styku s kůží.",
    frozenset([301, 331]): "Toxický při požití nebo při vdechování.",
    frozenset([311, 331]): "Toxický při styku s kůží a při vdechování.",
    frozenset([301, 311, 331]): "Toxický při požití, při styku s kůží nebo při vdechování.",
    frozenset([302, 312]): "Zdraví škodlivý při požití a při styku s kůží.",
    frozenset([302, 332]): "Zdraví škodlivý při požití nebo při vdechování.",
    frozenset([312, 332]): "Zdraví škodlivý při styku s kůží nebo při vdechování.",
    frozenset([302, 312, 332]): "Zdraví škodlivý při požití, při styku s kůží nebo při vdechování.",
}
