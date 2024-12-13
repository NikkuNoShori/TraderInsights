import { config, library } from '@fortawesome/fontawesome-svg-core';
import { 
  faMoneyBillWave,
  faBullseye,
  faChartLine,
  faCog,
  faSave,
  faTable
} from '@fortawesome/free-solid-svg-icons';

// Prevent Font Awesome from adding its CSS since we'll be adding it manually
config.autoAddCss = false;

// Add icons to library
library.add(
  faMoneyBillWave,
  faBullseye,
  faChartLine,
  faCog,
  faSave,
  faTable
); 