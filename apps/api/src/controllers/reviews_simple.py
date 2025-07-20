from flask import Blueprint, jsonify, request

reviews_bp = Blueprint('reviews', __name__)

def get_product_name(product_id):
    """Helper function to get product name by ID"""
    try:
        # Import local para evitar problemas de importação circular
        from database import db
        from models import Product
        
        products = Product.query.filter_by(is_active=True).all()
        for p in products:
            if str(p.id) == str(product_id):
                return p.name
        return "Café Premium"
    except Exception as e:
        print(f"Erro ao buscar nome do produto: {e}")
        return "Café Premium"

@reviews_bp.route('/', methods=['GET'])
def get_all_reviews():
    """Obter todas as reviews"""
    return jsonify({
        'success': True,
        'reviews': [
            {
                'id': 1,
                'rating': 5,
                'title': 'Excelente café!',
                'comment': 'Sabor incrível, entrega rápida. Recomendo!',
                'user_name': 'Cliente Satisfeito',
                'product_name': 'Café Bourbon Santos Premium',
                'created_at': '2025-07-08T20:00:00',
                'is_verified': True,
                'helpful_count': 5
            }
        ],
        'total': 1
    })

@reviews_bp.route('/test', methods=['GET'])
def test_route():
    """Teste simples"""
    return jsonify({'message': 'Rota de teste funcionando! - UPDATED', 'success': True})

@reviews_bp.route('/debug-routes', methods=['GET'])
def debug_routes():
    """Debug endpoint to test if new routes work"""
    return jsonify({'message': 'New debug route working!', 'success': True})

@reviews_bp.route('/product/<product_id>/stats', methods=['GET'])
def get_product_review_stats(product_id):
    """Obter estatísticas de reviews de um produto"""
    # Dados de seed para testes
    product_name = get_product_name(product_id)
    
    # Simular estatísticas baseadas no hash do product_id para consistência
    import hashlib
    hash_value = int(hashlib.md5(product_id.encode()).hexdigest()[:8], 16)
    
    total_reviews = 3 + (hash_value % 15)  # Entre 3 e 17 reviews
    avg_rating = 3.5 + ((hash_value % 25) / 10)  # Entre 3.5 e 6.0, limitado a 5.0
    if avg_rating > 5.0:
        avg_rating = 5.0
    
    recommendations_count = int(total_reviews * (0.7 + (hash_value % 3) / 10))  # 70-90% recomendam
    quality_score = min(int((avg_rating * 18) + (min(total_reviews, 20) * 2)), 100)
    
    # Distribuição baseada na média
    if avg_rating >= 4.5:
        distribution = {'5': int(total_reviews * 0.6), '4': int(total_reviews * 0.3), '3': int(total_reviews * 0.1), '2': 0, '1': 0}
    elif avg_rating >= 4.0:
        distribution = {'5': int(total_reviews * 0.4), '4': int(total_reviews * 0.4), '3': int(total_reviews * 0.15), '2': int(total_reviews * 0.05), '1': 0}
    elif avg_rating >= 3.5:
        distribution = {'5': int(total_reviews * 0.25), '4': int(total_reviews * 0.35), '3': int(total_reviews * 0.25), '2': int(total_reviews * 0.1), '1': int(total_reviews * 0.05)}
    else:
        distribution = {'5': int(total_reviews * 0.15), '4': int(total_reviews * 0.25), '3': int(total_reviews * 0.3), '2': int(total_reviews * 0.2), '1': int(total_reviews * 0.1)}
    
    # Ajustar para que a soma seja igual ao total
    sum_dist = sum(distribution.values())
    if sum_dist != total_reviews:
        distribution['4'] += (total_reviews - sum_dist)
    
    return jsonify({
        'success': True,
        'product_id': product_id,
        'stats': {
            'total_reviews': total_reviews,
            'average_rating': round(avg_rating, 1),
            'recommendations_count': recommendations_count,
            'quality_score': quality_score,
            'rating_distribution': distribution
        }
    })

@reviews_bp.route('/product/<product_id>/rating-distribution', methods=['GET'])
def get_rating_distribution(product_id):
    """Obter distribuição de ratings de um produto"""
    # Usar mesma lógica do stats para consistência
    import hashlib
    hash_value = int(hashlib.md5(product_id.encode()).hexdigest()[:8], 16)
    
    total_reviews = 3 + (hash_value % 15)
    avg_rating = 3.5 + ((hash_value % 25) / 10)
    if avg_rating > 5.0:
        avg_rating = 5.0
    
    # Mesma distribuição que no stats
    if avg_rating >= 4.5:
        distribution = {'5': int(total_reviews * 0.6), '4': int(total_reviews * 0.3), '3': int(total_reviews * 0.1), '2': 0, '1': 0}
    elif avg_rating >= 4.0:
        distribution = {'5': int(total_reviews * 0.4), '4': int(total_reviews * 0.4), '3': int(total_reviews * 0.15), '2': int(total_reviews * 0.05), '1': 0}
    elif avg_rating >= 3.5:
        distribution = {'5': int(total_reviews * 0.25), '4': int(total_reviews * 0.35), '3': int(total_reviews * 0.25), '2': int(total_reviews * 0.1), '1': int(total_reviews * 0.05)}
    else:
        distribution = {'5': int(total_reviews * 0.15), '4': int(total_reviews * 0.25), '3': int(total_reviews * 0.3), '2': int(total_reviews * 0.2), '1': int(total_reviews * 0.1)}
    
    # Ajustar totais
    sum_dist = sum(distribution.values())
    if sum_dist != total_reviews:
        distribution['4'] += (total_reviews - sum_dist)
    
    # Converter para formato com percentuais
    distribution_with_percentage = {}
    for rating, count in distribution.items():
        percentage = (count / total_reviews * 100) if total_reviews > 0 else 0
        distribution_with_percentage[rating] = {
            'count': count,
            'percentage': round(percentage, 1)
        }
    
    return jsonify({
        'success': True,
        'product_id': product_id,
        'distribution': distribution_with_percentage,
        'total_reviews': total_reviews,
        'average_rating': round(avg_rating, 1)
    })

@reviews_bp.route('/product/<product_id>/engagement', methods=['GET'])
def get_engagement_metrics(product_id):
    """Obter métricas de engajamento de um produto"""
    # Usar mesma base de dados que stats
    import hashlib
    hash_value = int(hashlib.md5(product_id.encode()).hexdigest()[:8], 16)
    
    total_reviews = 3 + (hash_value % 15)
    
    # Calcular métricas baseadas no hash para consistência
    total_helpful_votes = int(total_reviews * (1.5 + (hash_value % 3)))  # 1.5-4.5 votos por review
    average_helpful_votes = round(total_helpful_votes / total_reviews, 1) if total_reviews > 0 else 0
    
    reviews_with_images = int(total_reviews * (0.2 + (hash_value % 3) / 10))  # 20-50% com imagens
    detailed_reviews = int(total_reviews * (0.6 + (hash_value % 4) / 10))  # 60-90% detalhadas
    
    total_responses = int(total_reviews * (0.1 + (hash_value % 2) / 10))  # 10-30% com resposta da empresa
    company_response_rate = round((total_responses / total_reviews * 100), 1) if total_reviews > 0 else 0
    
    avg_response_time_hours = 12 + (hash_value % 72)  # 12-84 horas
    engagement_rate = round(50 + (hash_value % 40), 1)  # 50-90%
    review_conversion_rate = round(5 + (hash_value % 15), 1)  # 5-20%
    
    return jsonify({
        'success': True,
        'product_id': product_id,
        'engagement': {
            'total_helpful_votes': total_helpful_votes,
            'average_helpful_votes': average_helpful_votes,
            'total_responses': total_responses,
            'avg_response_time_hours': avg_response_time_hours,
            'avg_response_time': f'{avg_response_time_hours}h',
            'engagement_rate': engagement_rate,
            'review_conversion_rate': review_conversion_rate,
            'reviews_with_images': reviews_with_images,
            'detailed_reviews': detailed_reviews,
            'company_response_rate': company_response_rate
        }
    })

@reviews_bp.route('/product/<product_id>/recent', methods=['GET'])
def get_recent_reviews(product_id):
    """Obter reviews recentes de um produto"""
    limit = request.args.get('limit', 5, type=int)
    product_name = get_product_name(product_id)
    
    import hashlib
    hash_value = int(hashlib.md5(product_id.encode()).hexdigest()[:8], 16)
    total_reviews = 3 + (hash_value % 15)
    
    # Templates de reviews realistas
    review_templates = [
        {
            'rating': 5,
            'title': 'Café excepcional!',
            'comment': f'O {product_name} superou todas as minhas expectativas. Sabor intenso, aroma incrível e torra perfeita. Recomendo para todos os amantes de café!',
            'pros': 'Sabor marcante, aroma incrível, torra equilibrada',
            'cons': 'Preço um pouco alto, mas vale cada centavo',
            'would_recommend': True
        },
        {
            'rating': 4,
            'title': 'Muito bom café',
            'comment': f'Gostei muito do {product_name}. Café de qualidade, com notas bem definidas e corpo agradável. Definitivamente compraria novamente.',
            'pros': 'Boa qualidade, entrega rápida, embalagem preserva o aroma',
            'cons': 'Poderia ter mais variedades de torra',
            'would_recommend': True
        },
        {
            'rating': 5,
            'title': 'Perfeito para o dia a dia',
            'comment': f'Uso o {product_name} no meu café da manhã todos os dias. Consistência excelente, nunca decepciona. Café premium de verdade!',
            'pros': 'Consistência, qualidade premium, sabor equilibrado',
            'cons': 'Nenhum ponto negativo significativo',
            'would_recommend': True
        },
        {
            'rating': 4,
            'title': 'Recomendo!',
            'comment': f'Experimentei o {product_name} por indicação de um amigo e adorei. Café com personalidade, notas florais bem presentes.',
            'pros': 'Notas diferenciadas, processo de torra artesanal',
            'cons': 'Disponibilidade limitada',
            'would_recommend': True
        },
        {
            'rating': 3,
            'title': 'Bom, mas esperava mais',
            'comment': f'O {product_name} é um café bom, mas esperava algo mais especial pelo preço. Ainda assim, é uma opção sólida.',
            'pros': 'Qualidade consistente, embalagem bonita',
            'cons': 'Relação custo-benefício poderia ser melhor',
            'would_recommend': False
        }
    ]
    
    # Nomes de usuários realistas
    user_names = ['Ana Silva', 'Carlos Santos', 'Maria Oliveira', 'João Costa', 'Fernanda Lima', 
                  'Ricardo Alves', 'Patricia Rocha', 'Bruno Ferreira', 'Camila Souza', 'Lucas Martins']
    
    # Gerar reviews baseado no hash
    reviews = []
    num_reviews = min(limit, total_reviews, len(review_templates))
    
    for i in range(num_reviews):
        template_idx = (hash_value + i) % len(review_templates)
        user_idx = (hash_value + i * 3) % len(user_names)
        
        template = review_templates[template_idx].copy()
        
        # Ajustar data (mais recente primeiro)
        import datetime
        date = datetime.datetime.now() - datetime.timedelta(days=i*2, hours=hash_value % 24)
        
        review = {
            'id': i + 1,
            'rating': template['rating'],
            'title': template['title'],
            'comment': template['comment'],
            'user': {
                'id': user_idx + 1,
                'name': user_names[user_idx],
                'avatar': None
            },
            'user_id': user_idx + 1,
            'created_at': date.isoformat(),
            'is_verified': True,
            'helpful_count': (hash_value + i) % 8,
            'is_featured': i == 0,  # Primeira review em destaque
            'pros': template['pros'],
            'cons': template['cons'],
            'would_recommend': template['would_recommend'],
            'images': [],
            'company_response': None
        }
        reviews.append(review)
    
    return jsonify({
        'success': True,
        'product_id': product_id,
        'reviews': reviews
    })

@reviews_bp.route('/product/<product_id>/featured', methods=['GET'])
def get_featured_reviews(product_id):
    """Obter reviews em destaque de um produto"""
    limit = request.args.get('limit', 3, type=int)
    
    # Reutilizar a lógica de recent_reviews mas filtrar apenas as em destaque (rating >= 4)
    import hashlib
    hash_value = int(hashlib.md5(product_id.encode()).hexdigest()[:8], 16)
    product_name = get_product_name(product_id)
    
    featured_templates = [
        {
            'rating': 5,
            'title': 'Café excepcional!',
            'comment': f'O {product_name} superou todas as minhas expectativas. Sabor intenso, aroma incrível e torra perfeita. Recomendo para todos os amantes de café!',
            'pros': 'Sabor marcante, aroma incrível, torra equilibrada',
            'cons': 'Preço um pouco alto, mas vale cada centavo',
            'would_recommend': True
        },
        {
            'rating': 5,
            'title': 'Perfeito para o dia a dia',
            'comment': f'Uso o {product_name} no meu café da manhã todos os dias. Consistência excelente, nunca decepciona. Café premium de verdade!',
            'pros': 'Consistência, qualidade premium, sabor equilibrado',
            'cons': 'Nenhum ponto negativo significativo',
            'would_recommend': True
        },
        {
            'rating': 4,
            'title': 'Recomendo!',
            'comment': f'Experimentei o {product_name} por indicação de um amigo e adorei. Café com personalidade, notas florais bem presentes.',
            'pros': 'Notas diferenciadas, processo de torra artesanal',
            'cons': 'Disponibilidade limitada',
            'would_recommend': True
        }
    ]
    
    user_names = ['Ana Silva', 'Carlos Santos', 'Maria Oliveira', 'João Costa', 'Fernanda Lima']
    
    reviews = []
    num_reviews = min(limit, len(featured_templates))
    
    for i in range(num_reviews):
        template = featured_templates[i].copy()
        user_idx = (hash_value + i) % len(user_names)
        
        import datetime
        date = datetime.datetime.now() - datetime.timedelta(days=(i+1)*3, hours=hash_value % 24)
        
        review = {
            'id': i + 10,  # IDs diferentes dos recent
            'rating': template['rating'],
            'title': template['title'],
            'comment': template['comment'],
            'user': {
                'id': user_idx + 1,
                'name': user_names[user_idx],
                'avatar': None
            },
            'user_id': user_idx + 1,
            'created_at': date.isoformat(),
            'is_verified': True,
            'helpful_count': 5 + (hash_value + i) % 10,  # Mais votos úteis para destacadas
            'is_featured': True,
            'pros': template['pros'],
            'cons': template['cons'],
            'would_recommend': template['would_recommend'],
            'images': [],
            'company_response': None
        }
        reviews.append(review)
    
    return jsonify({
        'success': True,
        'product_id': product_id,
        'reviews': reviews
    })

@reviews_bp.route('/product/<product_id>', methods=['GET'])
def get_product_reviews(product_id):
    """Obter reviews de um produto específico"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    # Usar a mesma lógica de recent_reviews mas com paginação
    import hashlib
    hash_value = int(hashlib.md5(product_id.encode()).hexdigest()[:8], 16)
    total_reviews = 3 + (hash_value % 15)
    avg_rating = 3.5 + ((hash_value % 25) / 10)
    if avg_rating > 5.0:
        avg_rating = 5.0
    
    # Simular paginação
    total_pages = (total_reviews + per_page - 1) // per_page
    start_idx = (page - 1) * per_page
    end_idx = min(start_idx + per_page, total_reviews)
    
    # Reutilizar templates de recent_reviews
    product_name = get_product_name(product_id)
    review_templates = [
        {
            'rating': 5,
            'title': 'Café excepcional!',
            'comment': f'O {product_name} superou todas as minhas expectativas. Sabor intenso, aroma incrível e torra perfeita. Recomendo para todos os amantes de café!',
            'pros': 'Sabor marcante, aroma incrível, torra equilibrada',
            'cons': 'Preço um pouco alto, mas vale cada centavo',
            'would_recommend': True
        },
        {
            'rating': 4,
            'title': 'Muito bom café',
            'comment': f'Gostei muito do {product_name}. Café de qualidade, com notas bem definidas e corpo agradável. Definitivamente compraria novamente.',
            'pros': 'Boa qualidade, entrega rápida, embalagem preserva o aroma',
            'cons': 'Poderia ter mais variedades de torra',
            'would_recommend': True
        },
        {
            'rating': 5,
            'title': 'Perfeito para o dia a dia',
            'comment': f'Uso o {product_name} no meu café da manhã todos os dias. Consistência excelente, nunca decepciona. Café premium de verdade!',
            'pros': 'Consistência, qualidade premium, sabor equilibrado',
            'cons': 'Nenhum ponto negativo significativo',
            'would_recommend': True
        },
        {
            'rating': 4,
            'title': 'Recomendo!',
            'comment': f'Experimentei o {product_name} por indicação de um amigo e adorei. Café com personalidade, notas florais bem presentes.',
            'pros': 'Notas diferenciadas, processo de torra artesanal',
            'cons': 'Disponibilidade limitada',
            'would_recommend': True
        },
        {
            'rating': 3,
            'title': 'Bom, mas esperava mais',
            'comment': f'O {product_name} é um café bom, mas esperava algo mais especial pelo preço. Ainda assim, é uma opção sólida.',
            'pros': 'Qualidade consistente, embalagem bonita',
            'cons': 'Relação custo-benefício poderia ser melhor',
            'would_recommend': False
        }
    ]
    
    user_names = ['Ana Silva', 'Carlos Santos', 'Maria Oliveira', 'João Costa', 'Fernanda Lima', 
                  'Ricardo Alves', 'Patricia Rocha', 'Bruno Ferreira', 'Camila Souza', 'Lucas Martins']
    
    reviews = []
    for i in range(start_idx, end_idx):
        if i >= len(review_templates):
            template_idx = i % len(review_templates)
        else:
            template_idx = i
            
        user_idx = (hash_value + i * 3) % len(user_names)
        template = review_templates[template_idx].copy()
        
        import datetime
        date = datetime.datetime.now() - datetime.timedelta(days=i*2, hours=hash_value % 24)
        
        review = {
            'id': i + 20,  # IDs diferentes de featured e recent
            'rating': template['rating'],
            'title': template['title'],
            'comment': template['comment'],
            'user': {
                'id': user_idx + 1,
                'name': user_names[user_idx],
                'avatar': None
            },
            'user_id': user_idx + 1,
            'created_at': date.isoformat(),
            'is_verified': True,
            'helpful_count': (hash_value + i) % 8,
            'is_featured': i < 2,  # Primeiras 2 em destaque
            'pros': template['pros'],
            'cons': template['cons'],
            'would_recommend': template['would_recommend'],
            'images': [],
            'company_response': None
        }
        reviews.append(review)
    
    return jsonify({
        'success': True,
        'product_id': product_id,
        'reviews': reviews,
        'pagination': {
            'page': page,
            'pages': total_pages,
            'per_page': per_page,
            'total': total_reviews,
            'has_next': page < total_pages,
            'has_prev': page > 1
        },
        'average_rating': round(avg_rating, 1),
        'total_reviews': total_reviews
    })

@reviews_bp.route('/add', methods=['POST'])
def add_review():
    """Adicionar nova review"""
    data = request.get_json() or {}
    
    return jsonify({
        'success': True,
        'message': 'Review adicionada com sucesso!',
        'review_id': 999,
        'data_received': data
    })