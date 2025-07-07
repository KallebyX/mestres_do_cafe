// Sistema de Avaliações Premium - Mestres do Café Enterprise
// Exportações centralizadas para facilitar importações

import FeaturedReviews from './FeaturedReviews';
import ReviewForm from './ReviewForm';
import ReviewList from './ReviewList';
import ReviewStats from './ReviewStats';
import ReviewSystem from './ReviewSystem';

// Exportação padrão do sistema completo
export default ReviewSystem;

// Exportações nomeadas para uso individual
export {
  FeaturedReviews, ReviewForm,
  ReviewList,
  ReviewStats, ReviewSystem
};

// Exportação do serviço de API
  export { reviewsAPI } from '../../services/reviewsAPI';

// Exemplo de uso:
// import ReviewSystem from './components/reviews';
// import { ReviewForm, ReviewStats } from './components/reviews';
// import { reviewsAPI } from './components/reviews';