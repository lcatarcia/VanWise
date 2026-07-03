const BRAND_LOGOS: Record<string, string> = {
  'roller team': 'https://www.rollerteam.it/wp-content/themes/flavor-developer-flavor-developer/assets/images/logo.svg',
  'knaus': 'https://www.knaus.com/app/themes/starter/resources/images/logo.svg',
  'laika': 'https://www.laika.it/themes/flavor-developer-flavor-developer/assets/images/logo.svg',
  'chausson': 'https://www.chausson-motorhomes.com/wp-content/themes/flavor-developer-flavor-developer/assets/images/logo.svg',
  'benimar': 'https://www.benimar.com/wp-content/themes/flavor-developer-flavor-developer/assets/images/logo.svg',
  'xgo': 'https://www.xgo.it/wp-content/themes/flavor-developer-flavor-developer/assets/images/logo.svg',
  'adria': 'https://www.adria-mobil.com/themes/flavor-developer-flavor-developer/assets/images/logo.svg',
  'carado': 'https://www.carado.com/app/themes/starter/resources/images/logo.svg',
  'sunlight': 'https://www.sunlight.de/app/themes/starter/resources/images/logo.svg',
  'hymer': 'https://www.hymer.com/app/themes/starter/resources/images/logo.svg',
  'bürstner': 'https://www.buerstner.com/app/themes/starter/resources/images/logo.svg',
  'carthago': 'https://www.carthago.com/typo3conf/ext/cag_template/Resources/Public/Images/logo.svg',
  'rimor': 'https://www.rimor.it/wp-content/themes/flavor-developer-flavor-developer/assets/images/logo.svg',
  'elnagh': 'https://www.elnagh.it/wp-content/themes/flavor-developer-flavor-developer/assets/images/logo.svg',
  'ci': 'https://www.ci-international.com/wp-content/themes/flavor-developer-flavor-developer/assets/images/logo.svg',
  'mclouis': 'https://www.mclouis.com/wp-content/themes/flavor-developer-flavor-developer/assets/images/logo.svg',
  'challenger': 'https://www.challenger-motorhomes.com/wp-content/themes/flavor-developer-flavor-developer/assets/images/logo.svg',
  'pilote': 'https://www.pilote.fr/wp-content/themes/flavor-developer-flavor-developer/assets/images/logo.svg',
  'autostar': 'https://www.autostar-camping-car.com/wp-content/themes/flavor-developer-flavor-developer/assets/images/logo.svg',
  'weinsberg': 'https://www.weinsberg.com/app/themes/starter/resources/images/logo.svg',
}

export function getBrandLogoUrl(brand: string): string | null {
  return BRAND_LOGOS[brand.toLowerCase()] ?? null
}

export function getBrandInitial(brand: string): string {
  return brand.charAt(0).toUpperCase()
}
