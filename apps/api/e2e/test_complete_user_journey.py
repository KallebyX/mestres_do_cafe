"""
Testes End-to-End completos para jornada do usuário
Testa cenários reais completos com tratamento rigoroso de erros
"""

import pytest
import json
import time
from datetime import datetime, timedelta
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException

from apps.api.src.app import create_app
from apps.api.src.models.base import db
from apps.api.src.models.user import User
from apps.api.src.models.products import Product, Category
from apps.api.src.middleware.error_handler import ErrorCode

class TestCompleteUserJourney:
    """Testa jornada completa do usuário com tratamento de erros"""
    
    @pytest.fixture(scope="class")
    def app(self):
        """Cria aplicação de teste"""
        app = create_app()
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///test_e2e.db'
        
        with app.app_context():
            db.create_all()
            self.seed_test_data()
            yield app
            db.drop_all()
    
    @pytest.fixture(scope="class")
    def driver(self):
        """Configura driver do Selenium"""
        chrome_options = Options()
        chrome_options.add_argument("--headless")  # Executa sem interface gráfica
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")
        
        driver = webdriver.Chrome(options=chrome_options)
        driver.implicitly_wait(10)
        yield driver
        driver.quit()
    
    def seed_test_data(self):
        """Popula dados de teste"""
        # Categorias
        category1 = Category(name="Cafés Especiais", description="Cafés premium")
        category2 = Category(name="Cafés Tradicionais", description="Cafés do dia a dia")
        db.session.add_all([category1, category2])
        db.session.flush()
        
        # Produtos
        products = [
            Product(
                name="Café Geisha Premium",
                price=89.90,
                weight=250,
                category_id=category1.id,
                stock_quantity=10,
                description="Café especial com notas florais"
            ),
            Product(
                name="Café Bourbon Amarelo",
                price=45.90,
                weight=500,
                category_id=category1.id,
                stock_quantity=5,  # Estoque baixo para teste
                description="Café com notas de chocolate"
            ),
            Product(
                name="Café Tradicional",
                price=19.90,
                weight=500,
                category_id=category2.id,
                stock_quantity=0,  # Sem estoque para teste
                description="Café tradicional brasileiro"
            )
        ]
        db.session.add_all(products)
        db.session.commit()
    
    def test_complete_purchase_journey_success(self, driver, app):
        """Testa jornada completa de compra bem-sucedida"""
        try:
            # 1. Acessa a página inicial
            driver.get("http://localhost:5005")
            
            # Verifica se a página carregou
            assert "Mestres do Café" in driver.title
            
            # 2. Navega para produtos
            products_link = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((By.LINK_TEXT, "Produtos"))
            )
            products_link.click()
            
            # Verifica se chegou na página de produtos
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CLASS_NAME, "product-card"))
            )
            
            # 3. Seleciona um produto
            product_card = driver.find_element(By.CLASS_NAME, "product-card")
            product_card.click()
            
            # 4. Adiciona ao carrinho
            add_to_cart_btn = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((By.ID, "add-to-cart"))
            )
            add_to_cart_btn.click()
            
            # Verifica se foi adicionado ao carrinho
            cart_notification = WebDriverWait(driver, 5).until(
                EC.presence_of_element_located((By.CLASS_NAME, "cart-notification"))
            )
            assert "adicionado ao carrinho" in cart_notification.text.lower()
            
            # 5. Vai para o carrinho
            cart_link = driver.find_element(By.ID, "cart-link")
            cart_link.click()
            
            # Verifica se há itens no carrinho
            cart_items = WebDriverWait(driver, 10).until(
                EC.presence_of_all_elements_located((By.CLASS_NAME, "cart-item"))
            )
            assert len(cart_items) > 0
            
            # 6. Vai para checkout
            checkout_btn = driver.find_element(By.ID, "checkout-btn")
            checkout_btn.click()
            
            # 7. Preenche dados de entrega
            self.fill_shipping_form(driver)
            
            # 8. Seleciona método de pagamento
            payment_method = driver.find_element(By.ID, "credit-card")
            payment_method.click()
            
            # 9. Finaliza pedido
            finalize_btn = driver.find_element(By.ID, "finalize-order")
            finalize_btn.click()
            
            # 10. Verifica confirmação
            success_message = WebDriverWait(driver, 15).until(
                EC.presence_of_element_located((By.CLASS_NAME, "order-success"))
            )
            assert "pedido confirmado" in success_message.text.lower()
            
        except TimeoutException as e:
            pytest.fail(f"Timeout durante a jornada de compra: {e}")
        except NoSuchElementException as e:
            pytest.fail(f"Elemento não encontrado: {e}")
        except Exception as e:
            pytest.fail(f"Erro inesperado na jornada de compra: {e}")
    
    def test_purchase_journey_insufficient_stock(self, driver, app):
        """Testa jornada de compra com estoque insuficiente"""
        try:
            # 1. Acessa produto com estoque baixo
            driver.get("http://localhost:5005/products/2")  # Bourbon Amarelo (estoque: 5)
            
            # 2. Tenta adicionar quantidade maior que o estoque
            quantity_input = driver.find_element(By.ID, "quantity")
            quantity_input.clear()
            quantity_input.send_keys("10")  # Mais que o estoque disponível
            
            add_to_cart_btn = driver.find_element(By.ID, "add-to-cart")
            add_to_cart_btn.click()
            
            # 3. Verifica mensagem de erro
            error_message = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CLASS_NAME, "error-message"))
            )
            assert "estoque insuficiente" in error_message.text.lower()
            
            # 4. Verifica que o produto não foi adicionado ao carrinho
            cart_count = driver.find_element(By.ID, "cart-count")
            assert cart_count.text == "0"
            
        except Exception as e:
            pytest.fail(f"Erro no teste de estoque insuficiente: {e}")
    
    def test_purchase_journey_out_of_stock(self, driver, app):
        """Testa jornada com produto fora de estoque"""
        try:
            # 1. Acessa produto sem estoque
            driver.get("http://localhost:5005/products/3")  # Café Tradicional (estoque: 0)
            
            # 2. Verifica que botão de compra está desabilitado
            add_to_cart_btn = driver.find_element(By.ID, "add-to-cart")
            assert not add_to_cart_btn.is_enabled()
            
            # 3. Verifica mensagem de fora de estoque
            stock_message = driver.find_element(By.CLASS_NAME, "stock-status")
            assert "fora de estoque" in stock_message.text.lower()
            
        except Exception as e:
            pytest.fail(f"Erro no teste de produto fora de estoque: {e}")
    
    def test_user_registration_journey_success(self, driver, app):
        """Testa jornada de registro de usuário bem-sucedida"""
        try:
            # 1. Acessa página de registro
            driver.get("http://localhost:5005/register")
            
            # 2. Preenche formulário de registro
            name_input = driver.find_element(By.ID, "name")
            name_input.send_keys("João Silva")
            
            email_input = driver.find_element(By.ID, "email")
            email_input.send_keys(f"joao.{int(time.time())}@test.com")  # Email único
            
            password_input = driver.find_element(By.ID, "password")
            password_input.send_keys("senha123456")
            
            confirm_password_input = driver.find_element(By.ID, "confirm-password")
            confirm_password_input.send_keys("senha123456")
            
            # 3. Submete formulário
            register_btn = driver.find_element(By.ID, "register-btn")
            register_btn.click()
            
            # 4. Verifica redirecionamento para login
            WebDriverWait(driver, 10).until(
                EC.url_contains("/login")
            )
            
            # 5. Verifica mensagem de sucesso
            success_message = driver.find_element(By.CLASS_NAME, "success-message")
            assert "cadastro realizado" in success_message.text.lower()
            
        except Exception as e:
            pytest.fail(f"Erro no teste de registro: {e}")
    
    def test_user_registration_journey_validation_errors(self, driver, app):
        """Testa jornada de registro com erros de validação"""
        try:
            # 1. Acessa página de registro
            driver.get("http://localhost:5005/register")
            
            # 2. Tenta submeter formulário vazio
            register_btn = driver.find_element(By.ID, "register-btn")
            register_btn.click()
            
            # 3. Verifica mensagens de erro de campos obrigatórios
            error_messages = driver.find_elements(By.CLASS_NAME, "field-error")
            assert len(error_messages) >= 3  # Nome, email, senha
            
            # 4. Preenche email inválido
            email_input = driver.find_element(By.ID, "email")
            email_input.send_keys("email-invalido")
            register_btn.click()
            
            # 5. Verifica erro de formato de email
            email_error = driver.find_element(By.ID, "email-error")
            assert "email inválido" in email_error.text.lower()
            
            # 6. Preenche senha fraca
            password_input = driver.find_element(By.ID, "password")
            password_input.clear()
            password_input.send_keys("123")
            register_btn.click()
            
            # 7. Verifica erro de senha fraca
            password_error = driver.find_element(By.ID, "password-error")
            assert "senha muito fraca" in password_error.text.lower()
            
        except Exception as e:
            pytest.fail(f"Erro no teste de validação de registro: {e}")
    
    def test_login_journey_success(self, driver, app):
        """Testa jornada de login bem-sucedida"""
        try:
            # 1. Cria usuário de teste
            with app.app_context():
                test_user = User(
                    name="Test User",
                    email="test.login@test.com",
                    password_hash="$2b$12$hashed_password"  # Senha: testpass123
                )
                db.session.add(test_user)
                db.session.commit()
            
            # 2. Acessa página de login
            driver.get("http://localhost:5005/login")
            
            # 3. Preenche credenciais
            email_input = driver.find_element(By.ID, "email")
            email_input.send_keys("test.login@test.com")
            
            password_input = driver.find_element(By.ID, "password")
            password_input.send_keys("testpass123")
            
            # 4. Faz login
            login_btn = driver.find_element(By.ID, "login-btn")
            login_btn.click()
            
            # 5. Verifica redirecionamento para dashboard
            WebDriverWait(driver, 10).until(
                EC.url_contains("/dashboard")
            )
            
            # 6. Verifica que usuário está logado
            user_menu = driver.find_element(By.ID, "user-menu")
            assert "Test User" in user_menu.text
            
        except Exception as e:
            pytest.fail(f"Erro no teste de login: {e}")
    
    def test_login_journey_invalid_credentials(self, driver, app):
        """Testa jornada de login com credenciais inválidas"""
        try:
            # 1. Acessa página de login
            driver.get("http://localhost:5005/login")
            
            # 2. Preenche credenciais inválidas
            email_input = driver.find_element(By.ID, "email")
            email_input.send_keys("usuario@inexistente.com")
            
            password_input = driver.find_element(By.ID, "password")
            password_input.send_keys("senha-errada")
            
            # 3. Tenta fazer login
            login_btn = driver.find_element(By.ID, "login-btn")
            login_btn.click()
            
            # 4. Verifica mensagem de erro
            error_message = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CLASS_NAME, "login-error"))
            )
            assert "credenciais inválidas" in error_message.text.lower()
            
            # 5. Verifica que permanece na página de login
            assert "/login" in driver.current_url
            
        except Exception as e:
            pytest.fail(f"Erro no teste de credenciais inválidas: {e}")
    
    def test_search_journey_success(self, driver, app):
        """Testa jornada de busca bem-sucedida"""
        try:
            # 1. Acessa página inicial
            driver.get("http://localhost:5005")
            
            # 2. Faz busca por produto
            search_input = driver.find_element(By.ID, "search-input")
            search_input.send_keys("Geisha")
            
            search_btn = driver.find_element(By.ID, "search-btn")
            search_btn.click()
            
            # 3. Verifica resultados
            search_results = WebDriverWait(driver, 10).until(
                EC.presence_of_all_elements_located((By.CLASS_NAME, "search-result"))
            )
            assert len(search_results) > 0
            
            # 4. Verifica que produto correto aparece
            first_result = search_results[0]
            assert "geisha" in first_result.text.lower()
            
        except Exception as e:
            pytest.fail(f"Erro no teste de busca: {e}")
    
    def test_search_journey_no_results(self, driver, app):
        """Testa jornada de busca sem resultados"""
        try:
            # 1. Acessa página inicial
            driver.get("http://localhost:5005")
            
            # 2. Faz busca por termo inexistente
            search_input = driver.find_element(By.ID, "search-input")
            search_input.send_keys("produto-inexistente-xyz")
            
            search_btn = driver.find_element(By.ID, "search-btn")
            search_btn.click()
            
            # 3. Verifica mensagem de nenhum resultado
            no_results_message = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CLASS_NAME, "no-results"))
            )
            assert "nenhum resultado encontrado" in no_results_message.text.lower()
            
        except Exception as e:
            pytest.fail(f"Erro no teste de busca sem resultados: {e}")
    
    def test_cart_management_journey(self, driver, app):
        """Testa jornada de gerenciamento do carrinho"""
        try:
            # 1. Adiciona produto ao carrinho
            driver.get("http://localhost:5005/products/1")
            
            add_to_cart_btn = driver.find_element(By.ID, "add-to-cart")
            add_to_cart_btn.click()
            
            # 2. Vai para o carrinho
            cart_link = driver.find_element(By.ID, "cart-link")
            cart_link.click()
            
            # 3. Altera quantidade
            quantity_input = driver.find_element(By.CLASS_NAME, "quantity-input")
            quantity_input.clear()
            quantity_input.send_keys("2")
            
            update_btn = driver.find_element(By.CLASS_NAME, "update-quantity")
            update_btn.click()
            
            # 4. Verifica que total foi atualizado
            WebDriverWait(driver, 5).until(
                EC.text_to_be_present_in_element((By.ID, "cart-total"), "179,80")
            )
            
            # 5. Remove item do carrinho
            remove_btn = driver.find_element(By.CLASS_NAME, "remove-item")
            remove_btn.click()
            
            # 6. Confirma remoção
            confirm_btn = WebDriverWait(driver, 5).until(
                EC.element_to_be_clickable((By.ID, "confirm-remove"))
            )
            confirm_btn.click()
            
            # 7. Verifica que carrinho está vazio
            empty_cart_message = WebDriverWait(driver, 5).until(
                EC.presence_of_element_located((By.CLASS_NAME, "empty-cart"))
            )
            assert "carrinho vazio" in empty_cart_message.text.lower()
            
        except Exception as e:
            pytest.fail(f"Erro no teste de gerenciamento do carrinho: {e}")
    
    def test_responsive_design_journey(self, driver, app):
        """Testa jornada em diferentes tamanhos de tela"""
        try:
            # 1. Testa em desktop
            driver.set_window_size(1920, 1080)
            driver.get("http://localhost:5005")
            
            # Verifica layout desktop
            header = driver.find_element(By.TAG_NAME, "header")
            assert header.is_displayed()
            
            # 2. Testa em tablet
            driver.set_window_size(768, 1024)
            driver.refresh()
            
            # Verifica que layout se adapta
            mobile_menu = driver.find_element(By.ID, "mobile-menu-toggle")
            assert mobile_menu.is_displayed()
            
            # 3. Testa em mobile
            driver.set_window_size(375, 667)
            driver.refresh()
            
            # Verifica navegação mobile
            mobile_menu.click()
            nav_menu = WebDriverWait(driver, 5).until(
                EC.visibility_of_element_located((By.ID, "mobile-nav"))
            )
            assert nav_menu.is_displayed()
            
        except Exception as e:
            pytest.fail(f"Erro no teste de design responsivo: {e}")
    
    def test_performance_journey(self, driver, app):
        """Testa performance da aplicação"""
        try:
            # 1. Mede tempo de carregamento da página inicial
            start_time = time.time()
            driver.get("http://localhost:5005")
            
            # Aguarda carregamento completo
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CLASS_NAME, "hero-section"))
            )
            load_time = time.time() - start_time
            
            # Verifica que carregou em menos de 3 segundos
            assert load_time < 3.0, f"Página demorou {load_time:.2f}s para carregar"
            
            # 2. Testa navegação entre páginas
            start_time = time.time()
            products_link = driver.find_element(By.LINK_TEXT, "Produtos")
            products_link.click()
            
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CLASS_NAME, "products-grid"))
            )
            navigation_time = time.time() - start_time
            
            # Verifica navegação rápida
            assert navigation_time < 2.0, f"Navegação demorou {navigation_time:.2f}s"
            
        except Exception as e:
            pytest.fail(f"Erro no teste de performance: {e}")
    
    def fill_shipping_form(self, driver):
        """Preenche formulário de entrega"""
        fields = {
            "shipping-name": "João Silva",
            "shipping-email": "joao@test.com",
            "shipping-phone": "(11) 99999-9999",
            "shipping-address": "Rua das Flores, 123",
            "shipping-city": "São Paulo",
            "shipping-state": "SP",
            "shipping-zipcode": "01234-567"
        }
        
        for field_id, value in fields.items():
            field = driver.find_element(By.ID, field_id)
            field.clear()
            field.send_keys(value)

class TestErrorHandlingE2E:
    """Testa tratamento de erros em cenários E2E"""
    
    @pytest.fixture(scope="class")
    def driver(self):
        """Configura driver do Selenium"""
        chrome_options = Options()
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        
        driver = webdriver.Chrome(options=chrome_options)
        driver.implicitly_wait(10)
        yield driver
        driver.quit()
    
    def test_network_error_handling(self, driver):
        """Testa tratamento de erros de rede"""
        try:
            # 1. Simula perda de conexão
            driver.execute_script("window.navigator.onLine = false;")
            
            # 2. Tenta fazer uma ação que requer rede
            driver.get("http://localhost:5005/products")
            
            # 3. Verifica mensagem de erro de conexão
            error_message = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CLASS_NAME, "network-error"))
            )
            assert "sem conexão" in error_message.text.lower()
            
        except Exception as e:
            pytest.fail(f"Erro no teste de erro de rede: {e}")
    
    def test_server_error_handling(self, driver):
        """Testa tratamento de erros do servidor"""
        try:
            # 1. Acessa endpoint que retorna erro 500
            driver.get("http://localhost:5005/api/test-error")
            
            # 2. Verifica que erro é tratado graciosamente
            error_page = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CLASS_NAME, "error-page"))
            )
            assert "erro interno" in error_page.text.lower()
            
            # 3. Verifica que há opção de voltar
            back_btn = driver.find_element(By.ID, "back-to-home")
            assert back_btn.is_displayed()
            
        except Exception as e:
            pytest.fail(f"Erro no teste de erro do servidor: {e}")
    
    def test_form_validation_errors(self, driver):
        """Testa erros de validação em formulários"""
        try:
            # 1. Acessa formulário de contato
            driver.get("http://localhost:5005/contact")
            
            # 2. Submete formulário vazio
            submit_btn = driver.find_element(By.ID, "submit-contact")
            submit_btn.click()
            
            # 3. Verifica que erros são exibidos
            error_messages = driver.find_elements(By.CLASS_NAME, "validation-error")
            assert len(error_messages) > 0
            
            # 4. Verifica que formulário não foi submetido
            assert "/contact" in driver.current_url
            
        except Exception as e:
            pytest.fail(f"Erro no teste de validação de formulário: {e}")

# Utilitários para testes E2E
def wait_for_page_load(driver, timeout=10):
    """Aguarda carregamento completo da página"""
    WebDriverWait(driver, timeout).until(
        lambda d: d.execute_script("return document.readyState") == "complete"
    )

def take_screenshot_on_failure(driver, test_name):
    """Tira screenshot em caso de falha"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"screenshot_{test_name}_{timestamp}.png"
    driver.save_screenshot(f"tests/screenshots/{filename}")
    return filename

def check_console_errors(driver):
    """Verifica erros no console do navegador"""
    logs = driver.get_log('browser')
    errors = [log for log in logs if log['level'] == 'SEVERE']
    return errors

def measure_page_performance(driver):
    """Mede métricas de performance da página"""
    navigation_timing = driver.execute_script("""
        return {
            loadEventEnd: performance.timing.loadEventEnd,
            navigationStart: performance.timing.navigationStart,
            domContentLoaded: performance.timing.domContentLoadedEventEnd
        };
    """)
    
    load_time = navigation_timing['loadEventEnd'] - navigation_timing['navigationStart']
    dom_ready_time = navigation_timing['domContentLoaded'] - navigation_timing['navigationStart']
    
    return {
        'load_time': load_time / 1000,  # Converte para segundos
        'dom_ready_time': dom_ready_time / 1000
    }

