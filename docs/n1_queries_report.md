# Relatório de Queries N+1

Total de issues: 3106
Total de boas práticas: 2173

## Issues Encontrados

- **apps/api/unify_databases.py:17** - Acesso a atributo de relação em loop
  ```python
  for db_file in Path('.').glob('*.db'):
  ```

- **apps/api/unify_databases.py:144** - Possível acesso a relação em serialização
  ```python
  unified_db_path = "mestres_cafe_unified.db"
  ```

- **apps/api/unify_databases.py:181** - Possível acesso a relação em serialização
  ```python
  final_db_path = "mestres_cafe.db"
  ```

- **apps/api/venv/lib/python3.9/site-packages/mccabe.py:30** - Loop com query de relação
  ```python
  for child in iter_child_nodes(node):
  ```

- **apps/api/venv/lib/python3.9/site-packages/mccabe.py:30** - Acesso a atributo de relação em loop
  ```python
  for child in iter_child_nodes(node):
  ```

- **apps/api/venv/lib/python3.9/site-packages/pycodestyle.py:139** - Acesso a atributo de relação em loop
  ```python
  r'^\s*({})\b'.format('|'.join(s.replace(' ', r'\s+') for s in (
  ```

- **apps/api/venv/lib/python3.9/site-packages/pycodestyle.py:86** - Possível acesso a relação em serialização
  ```python
  PROJECT_CONFIG = ('setup.cfg', 'tox.ini')
  ```

- **apps/api/venv/lib/python3.9/site-packages/pycodestyle.py:86** - Possível acesso a relação em serialização
  ```python
  PROJECT_CONFIG = ('setup.cfg', 'tox.ini')
  ```

- **apps/api/venv/lib/python3.9/site-packages/pycodestyle.py:2381** - Possível acesso a relação em serialização
  ```python
  Check if 'options.exclude' contains a pattern matching filename.
  ```

- **apps/api/venv/lib/python3.9/site-packages/pycodestyle.py:2396** - Possível acesso a relação em serialização
  ```python
  If 'options.select' contains a prefix of the error code,
  ```

- **apps/api/venv/lib/python3.9/site-packages/pycodestyle.py:2397** - Possível acesso a relação em serialização
  ```python
  return False.  Else, if 'options.ignore' contains a prefix of
  ```

- **apps/api/venv/lib/python3.9/site-packages/mypy_extensions.py:77** - Loop com query de relação
  ```python
  for base in bases:
  ```

- **apps/api/venv/lib/python3.9/site-packages/mypy_extensions.py:77** - Acesso a atributo de relação em loop
  ```python
  for base in bases:
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:137** - Acesso a atributo de relação em loop
  ```python
  attrs += [attr.name for attr in self._moved_attributes]
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:274** - Possível acesso a relação em serialização
  ```python
  MovedModule("collections_abc", "collections", "collections.abc" if sys.version_info >= (3, 3) else "collections"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:276** - Possível acesso a relação em serialização
  ```python
  MovedModule("dbm_gnu", "gdbm", "dbm.gnu"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:277** - Possível acesso a relação em serialização
  ```python
  MovedModule("dbm_ndbm", "dbm", "dbm.ndbm"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:279** - Possível acesso a relação em serialização
  ```python
  MovedModule("http_cookiejar", "cookielib", "http.cookiejar"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:280** - Possível acesso a relação em serialização
  ```python
  MovedModule("http_cookies", "Cookie", "http.cookies"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:281** - Possível acesso a relação em serialização
  ```python
  MovedModule("html_entities", "htmlentitydefs", "html.entities"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:282** - Possível acesso a relação em serialização
  ```python
  MovedModule("html_parser", "HTMLParser", "html.parser"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:283** - Possível acesso a relação em serialização
  ```python
  MovedModule("http_client", "httplib", "http.client"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:284** - Possível acesso a relação em serialização
  ```python
  MovedModule("email_mime_base", "email.MIMEBase", "email.mime.base"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:285** - Possível acesso a relação em serialização
  ```python
  MovedModule("email_mime_image", "email.MIMEImage", "email.mime.image"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:286** - Possível acesso a relação em serialização
  ```python
  MovedModule("email_mime_multipart", "email.MIMEMultipart", "email.mime.multipart"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:287** - Possível acesso a relação em serialização
  ```python
  MovedModule("email_mime_nonmultipart", "email.MIMENonMultipart", "email.mime.nonmultipart"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:288** - Possível acesso a relação em serialização
  ```python
  MovedModule("email_mime_text", "email.MIMEText", "email.mime.text"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:289** - Possível acesso a relação em serialização
  ```python
  MovedModule("BaseHTTPServer", "BaseHTTPServer", "http.server"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:290** - Possível acesso a relação em serialização
  ```python
  MovedModule("CGIHTTPServer", "CGIHTTPServer", "http.server"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:291** - Possível acesso a relação em serialização
  ```python
  MovedModule("SimpleHTTPServer", "SimpleHTTPServer", "http.server"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:298** - Possível acesso a relação em serialização
  ```python
  MovedModule("tkinter_dialog", "Dialog", "tkinter.dialog"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:299** - Possível acesso a relação em serialização
  ```python
  MovedModule("tkinter_filedialog", "FileDialog", "tkinter.filedialog"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:300** - Possível acesso a relação em serialização
  ```python
  MovedModule("tkinter_scrolledtext", "ScrolledText", "tkinter.scrolledtext"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:301** - Possível acesso a relação em serialização
  ```python
  MovedModule("tkinter_simpledialog", "SimpleDialog", "tkinter.simpledialog"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:302** - Possível acesso a relação em serialização
  ```python
  MovedModule("tkinter_tix", "Tix", "tkinter.tix"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:303** - Possível acesso a relação em serialização
  ```python
  MovedModule("tkinter_ttk", "ttk", "tkinter.ttk"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:304** - Possível acesso a relação em serialização
  ```python
  MovedModule("tkinter_constants", "Tkconstants", "tkinter.constants"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:305** - Possível acesso a relação em serialização
  ```python
  MovedModule("tkinter_dnd", "Tkdnd", "tkinter.dnd"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:307** - Possível acesso a relação em serialização
  ```python
  "tkinter.colorchooser"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:309** - Possível acesso a relação em serialização
  ```python
  "tkinter.commondialog"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:310** - Possível acesso a relação em serialização
  ```python
  MovedModule("tkinter_tkfiledialog", "tkFileDialog", "tkinter.filedialog"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:311** - Possível acesso a relação em serialização
  ```python
  MovedModule("tkinter_font", "tkFont", "tkinter.font"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:312** - Possível acesso a relação em serialização
  ```python
  MovedModule("tkinter_messagebox", "tkMessageBox", "tkinter.messagebox"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:314** - Possível acesso a relação em serialização
  ```python
  "tkinter.simpledialog"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:315** - Possível acesso a relação em serialização
  ```python
  MovedModule("urllib_parse", __name__ + ".moves.urllib_parse", "urllib.parse"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:316** - Possível acesso a relação em serialização
  ```python
  MovedModule("urllib_error", __name__ + ".moves.urllib_error", "urllib.error"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:318** - Possível acesso a relação em serialização
  ```python
  MovedModule("urllib_robotparser", "robotparser", "urllib.robotparser"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:319** - Possível acesso a relação em serialização
  ```python
  MovedModule("xmlrpc_client", "xmlrpclib", "xmlrpc.client"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:320** - Possível acesso a relação em serialização
  ```python
  MovedModule("xmlrpc_server", "SimpleXMLRPCServer", "xmlrpc.server"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:346** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("ParseResult", "urlparse", "urllib.parse"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:347** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("SplitResult", "urlparse", "urllib.parse"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:348** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("parse_qs", "urlparse", "urllib.parse"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:349** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("parse_qsl", "urlparse", "urllib.parse"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:350** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("urldefrag", "urlparse", "urllib.parse"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:351** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("urljoin", "urlparse", "urllib.parse"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:352** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("urlparse", "urlparse", "urllib.parse"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:353** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("urlsplit", "urlparse", "urllib.parse"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:354** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("urlunparse", "urlparse", "urllib.parse"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:355** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("urlunsplit", "urlparse", "urllib.parse"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:356** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("quote", "urllib", "urllib.parse"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:357** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("quote_plus", "urllib", "urllib.parse"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:358** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("unquote", "urllib", "urllib.parse"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:359** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("unquote_plus", "urllib", "urllib.parse"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:360** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("unquote_to_bytes", "urllib", "urllib.parse", "unquote", "unquote_to_bytes"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:361** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("urlencode", "urllib", "urllib.parse"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:362** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("splitquery", "urllib", "urllib.parse"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:363** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("splittag", "urllib", "urllib.parse"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:364** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("splituser", "urllib", "urllib.parse"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:365** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("splitvalue", "urllib", "urllib.parse"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:366** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("uses_fragment", "urlparse", "urllib.parse"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:367** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("uses_netloc", "urlparse", "urllib.parse"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:368** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("uses_params", "urlparse", "urllib.parse"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:369** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("uses_query", "urlparse", "urllib.parse"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:370** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("uses_relative", "urlparse", "urllib.parse"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:379** - Possível acesso a relação em serialização
  ```python
  "moves.urllib_parse", "moves.urllib.parse")
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:388** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("URLError", "urllib2", "urllib.error"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:389** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("HTTPError", "urllib2", "urllib.error"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:390** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("ContentTooShortError", "urllib", "urllib.error"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:399** - Possível acesso a relação em serialização
  ```python
  "moves.urllib_error", "moves.urllib.error")
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:408** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("urlopen", "urllib2", "urllib.request"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:409** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("install_opener", "urllib2", "urllib.request"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:410** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("build_opener", "urllib2", "urllib.request"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:411** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("pathname2url", "urllib", "urllib.request"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:412** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("url2pathname", "urllib", "urllib.request"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:413** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("getproxies", "urllib", "urllib.request"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:414** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("Request", "urllib2", "urllib.request"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:415** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("OpenerDirector", "urllib2", "urllib.request"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:416** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("HTTPDefaultErrorHandler", "urllib2", "urllib.request"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:417** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("HTTPRedirectHandler", "urllib2", "urllib.request"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:418** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("HTTPCookieProcessor", "urllib2", "urllib.request"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:419** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("ProxyHandler", "urllib2", "urllib.request"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:420** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("BaseHandler", "urllib2", "urllib.request"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:421** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("HTTPPasswordMgr", "urllib2", "urllib.request"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:422** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("HTTPPasswordMgrWithDefaultRealm", "urllib2", "urllib.request"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:423** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("AbstractBasicAuthHandler", "urllib2", "urllib.request"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:424** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("HTTPBasicAuthHandler", "urllib2", "urllib.request"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:425** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("ProxyBasicAuthHandler", "urllib2", "urllib.request"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:426** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("AbstractDigestAuthHandler", "urllib2", "urllib.request"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:427** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("HTTPDigestAuthHandler", "urllib2", "urllib.request"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:428** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("ProxyDigestAuthHandler", "urllib2", "urllib.request"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:429** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("HTTPHandler", "urllib2", "urllib.request"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:430** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("HTTPSHandler", "urllib2", "urllib.request"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:431** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("FileHandler", "urllib2", "urllib.request"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:432** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("FTPHandler", "urllib2", "urllib.request"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:433** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("CacheFTPHandler", "urllib2", "urllib.request"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:434** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("UnknownHandler", "urllib2", "urllib.request"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:435** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("HTTPErrorProcessor", "urllib2", "urllib.request"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:436** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("urlretrieve", "urllib", "urllib.request"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:437** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("urlcleanup", "urllib", "urllib.request"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:438** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("proxy_bypass", "urllib", "urllib.request"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:439** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("parse_http_list", "urllib2", "urllib.request"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:440** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("parse_keqv_list", "urllib2", "urllib.request"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:445** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("URLopener", "urllib", "urllib.request"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:446** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("FancyURLopener", "urllib", "urllib.request"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:456** - Possível acesso a relação em serialização
  ```python
  "moves.urllib_request", "moves.urllib.request")
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:465** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("addbase", "urllib", "urllib.response"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:466** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("addclosehook", "urllib", "urllib.response"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:467** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("addinfo", "urllib", "urllib.response"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:468** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("addinfourl", "urllib", "urllib.response"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:477** - Possível acesso a relação em serialização
  ```python
  "moves.urllib_response", "moves.urllib.response")
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:486** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("RobotFileParser", "robotparser", "urllib.robotparser"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:495** - Possível acesso a relação em serialização
  ```python
  "moves.urllib_robotparser", "moves.urllib.robotparser")
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:502** - Possível acesso a relação em serialização
  ```python
  parse = _importer._get_module("moves.urllib_parse")
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:503** - Possível acesso a relação em serialização
  ```python
  error = _importer._get_module("moves.urllib_error")
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:504** - Possível acesso a relação em serialização
  ```python
  request = _importer._get_module("moves.urllib_request")
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:505** - Possível acesso a relação em serialização
  ```python
  response = _importer._get_module("moves.urllib_response")
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:506** - Possível acesso a relação em serialização
  ```python
  robotparser = _importer._get_module("moves.urllib_robotparser")
  ```

- **apps/api/venv/lib/python3.9/site-packages/six.py:512** - Possível acesso a relação em serialização
  ```python
  "moves.urllib")
  ```

- **apps/api/venv/lib/python3.9/site-packages/py.py:9** - Possível acesso a relação em serialização
  ```python
  sys.modules["py.error"] = error
  ```

- **apps/api/venv/lib/python3.9/site-packages/py.py:10** - Possível acesso a relação em serialização
  ```python
  sys.modules["py.path"] = path
  ```

- **apps/api/venv/lib/python3.9/site-packages/typing_extensions.py:329** - Loop com query de relação
  ```python
  for p in parameters:
  ```

- **apps/api/venv/lib/python3.9/site-packages/typing_extensions.py:329** - Acesso a atributo de relação em loop
  ```python
  for p in parameters:
  ```

- **apps/api/venv/lib/python3.9/site-packages/typing_extensions.py:204** - Possível acesso a relação em serialização
  ```python
  return "typing_extensions.Any"
  ```

- **apps/api/venv/lib/python3.9/site-packages/typing_extensions.py:552** - Possível acesso a relação em serialização
  ```python
  'collections.abc': [
  ```

- **apps/api/venv/lib/python3.9/site-packages/typing_extensions.py:969** - Possível acesso a relação em serialização
  ```python
  return "typing_extensions.NoDefault"
  ```

- **apps/api/venv/lib/python3.9/site-packages/typing_extensions.py:989** - Possível acesso a relação em serialização
  ```python
  return "typing_extensions.NoExtraItems"
  ```

- **apps/api/venv/lib/python3.9/site-packages/typing_extensions.py:2653** - Possível acesso a relação em serialização
  ```python
  will produce output similar to 'Revealed type is "builtins.int"'.
  ```

- **apps/api/venv/lib/python3.9/site-packages/typing_extensions.py:3388** - Possível acesso a relação em serialização
  ```python
  deprecation_msg.format(name=deprecated_thing, remove="3.15"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/typing_extensions.py:3658** - Possível acesso a relação em serialização
  ```python
  f"attribute '{name}' of 'typing.TypeAliasType' objects "
  ```

- **apps/api/venv/lib/python3.9/site-packages/typing_extensions.py:3663** - Possível acesso a relação em serialização
  ```python
  f"'typing.TypeAliasType' object has no attribute '{name}'"
  ```

- **apps/api/venv/lib/python3.9/site-packages/typing_extensions.py:3718** - Possível acesso a relação em serialização
  ```python
  "type 'typing_extensions.TypeAliasType' is not an acceptable base type"
  ```

- **apps/api/venv/lib/python3.9/site-packages/jwt/algorithms.py:81** - Acesso a atributo de relação em loop
  ```python
  # Type aliases for convenience in algorithms method signatures
  ```

- **apps/api/venv/lib/python3.9/site-packages/jwt/api_jwt.py:62** - Acesso a atributo de relação em loop
  ```python
  for time_claim in ["exp", "iat", "nbf"]:
  ```

- **apps/api/venv/lib/python3.9/site-packages/jwt/api_jwk.py:94** - Acesso a atributo de relação em loop
  ```python
  for key in keys:
  ```

- **apps/api/venv/lib/python3.9/site-packages/jwt/api_jws.py:41** - Acesso a atributo de relação em loop
  ```python
  for key in list(self._algorithms.keys()):
  ```

- **apps/api/venv/lib/python3.9/site-packages/flask/logging.py:36** - Acesso a atributo de relação em loop
  ```python
  if any(handler.level <= level for handler in current.handlers):
  ```

- **apps/api/venv/lib/python3.9/site-packages/flask/logging.py:25** - Possível acesso a relação em serialização
  ```python
  return request.environ["wsgi.errors"] if request else sys.stderr
  ```

- **apps/api/venv/lib/python3.9/site-packages/flask/config.py:134** - Acesso a atributo de relação em loop
  ```python
  for key in sorted(os.environ):
  ```

- **apps/api/venv/lib/python3.9/site-packages/flask/config.py:38** - Possível acesso a relação em serialização
  ```python
  app.config.from_pyfile('yourconfig.cfg')
  ```

- **apps/api/venv/lib/python3.9/site-packages/flask/config.py:212** - Possível acesso a relação em serialização
  ```python
  app.config.from_object('yourapplication.default_config')
  ```

- **apps/api/venv/lib/python3.9/site-packages/flask/config.py:250** - Possível acesso a relação em serialização
  ```python
  app.config.from_file("config.json", load=json.load)
  ```

- **apps/api/venv/lib/python3.9/site-packages/flask/config.py:253** - Possível acesso a relação em serialização
  ```python
  app.config.from_file("config.toml", load=tomllib.load, text=False)
  ```

- **apps/api/venv/lib/python3.9/site-packages/flask/templating.py:53** - Acesso a atributo de relação em loop
  ```python
  """A loader that looks for templates in the application and all
  ```

- **apps/api/venv/lib/python3.9/site-packages/flask/globals.py:24** - Possível acesso a relação em serialização
  ```python
  _cv_app: ContextVar[AppContext] = ContextVar("flask.app_ctx")
  ```

- **apps/api/venv/lib/python3.9/site-packages/flask/globals.py:42** - Possível acesso a relação em serialização
  ```python
  _cv_request: ContextVar[RequestContext] = ContextVar("flask.request_ctx")
  ```

- **apps/api/venv/lib/python3.9/site-packages/flask/blueprints.py:76** - Possível acesso a relação em serialização
  ```python
  with app.open_resource("schema.sql") as f:
  ```

- **apps/api/venv/lib/python3.9/site-packages/flask/cli.py:40** - Loop com query de relação
  ```python
  for attr_name in ("app", "application"):
  ```

- **apps/api/venv/lib/python3.9/site-packages/flask/cli.py:40** - Acesso a atributo de relação em loop
  ```python
  for attr_name in ("app", "application"):
  ```

- **apps/api/venv/lib/python3.9/site-packages/flask/cli.py:208** - Possível acesso a relação em serialização
  ```python
  if not os.path.exists(os.path.join(path, "__init__.py")):
  ```

- **apps/api/venv/lib/python3.9/site-packages/flask/cli.py:311** - Possível acesso a relação em serialização
  ```python
  for path in ("wsgi.py", "app.py"):
  ```

- **apps/api/venv/lib/python3.9/site-packages/flask/cli.py:311** - Possível acesso a relação em serialização
  ```python
  for path in ("wsgi.py", "app.py"):
  ```

- **apps/api/venv/lib/python3.9/site-packages/flask/cli.py:322** - Possível acesso a relação em serialização
  ```python
  " variable, or a 'wsgi.py' or 'app.py' file in the"
  ```

- **apps/api/venv/lib/python3.9/site-packages/flask/cli.py:322** - Possível acesso a relação em serialização
  ```python
  " variable, or a 'wsgi.py' or 'app.py' file in the"
  ```

- **apps/api/venv/lib/python3.9/site-packages/flask/cli.py:560** - Possível acesso a relação em serialização
  ```python
  for ep in metadata.entry_points(group="flask.commands"):
  ```

- **apps/api/venv/lib/python3.9/site-packages/flask/cli.py:1057** - Possível acesso a relação em serialização
  ```python
  'FLASK_APP' environment variable, or with a 'wsgi.py' or 'app.py' file
  ```

- **apps/api/venv/lib/python3.9/site-packages/flask/cli.py:1057** - Possível acesso a relação em serialização
  ```python
  'FLASK_APP' environment variable, or with a 'wsgi.py' or 'app.py' file
  ```

- **apps/api/venv/lib/python3.9/site-packages/flask/app.py:477** - Loop com query de relação
  ```python
  for name in names:
  ```

- **apps/api/venv/lib/python3.9/site-packages/flask/app.py:477** - Acesso a atributo de relação em loop
  ```python
  for name in names:
  ```

- **apps/api/venv/lib/python3.9/site-packages/flask/app.py:319** - Possível acesso a relação em serialização
  ```python
  with app.open_resource("schema.sql") as f:
  ```

- **apps/api/venv/lib/python3.9/site-packages/flask/app.py:385** - Possível acesso a relação em serialização
  ```python
  rv.policies["json.dumps_function"] = self.json.dumps
  ```

- **apps/api/venv/lib/python3.9/site-packages/flask/debughelpers.py:32** - Acesso a atributo de relação em loop
  ```python
  names = ", ".join(repr(x) for x in form_matches)
  ```

- **apps/api/venv/lib/python3.9/site-packages/flask/ctx.py:414** - Possível acesso a relação em serialização
  ```python
  ctx.request.environ["werkzeug.request"] = None
  ```

- **apps/api/venv/lib/python3.9/site-packages/flask/helpers.py:373** - Loop com query de relação
  ```python
  return [x[1] for x in flashes]
  ```

- **apps/api/venv/lib/python3.9/site-packages/flask/helpers.py:373** - Acesso a atributo de relação em loop
  ```python
  return [x[1] for x in flashes]
  ```

- **apps/api/venv/lib/python3.9/site-packages/flask/helpers.py:139** - Possível acesso a relação em serialização
  ```python
  return render_template('index.html', foo=42)
  ```

- **apps/api/venv/lib/python3.9/site-packages/flask/helpers.py:144** - Possível acesso a relação em serialização
  ```python
  response = make_response(render_template('index.html', foo=42))
  ```

- **apps/api/venv/lib/python3.9/site-packages/flask/helpers.py:152** - Possível acesso a relação em serialização
  ```python
  response = make_response(render_template('not_found.html'), 404)
  ```

- **apps/api/venv/lib/python3.9/site-packages/flask/helpers.py:290** - Possível acesso a relação em serialização
  ```python
  hello = get_template_attribute('_cider.html', 'hello')
  ```

- **apps/api/venv/lib/python3.9/site-packages/flask/views.py:120** - Acesso a atributo de relação em loop
  ```python
  for decorator in cls.decorators:
  ```

- **apps/api/venv/lib/python3.9/site-packages/flask/sansio/blueprints.py:316** - Acesso a atributo de relação em loop
  ```python
  first_bp_registration = not any(bp is self for bp in app.blueprints.values())
  ```

- **apps/api/venv/lib/python3.9/site-packages/flask/sansio/app.py:399** - Loop com query de relação
  ```python
  #:                            for value in values)
  ```

- **apps/api/venv/lib/python3.9/site-packages/flask/sansio/app.py:399** - Acesso a atributo de relação em loop
  ```python
  #:                            for value in values)
  ```

- **apps/api/venv/lib/python3.9/site-packages/flask/sansio/app.py:457** - Possível acesso a relação em serialização
  ```python
  hard-coding ``"flask.app"``.
  ```

- **apps/api/venv/lib/python3.9/site-packages/flask/sansio/app.py:461** - Possível acesso a relação em serialização
  ```python
  ``"flask.app"``. The level is only set during configuration,
  ```

- **apps/api/venv/lib/python3.9/site-packages/flask/sansio/scaffold.py:748** - Acesso a atributo de relação em loop
  ```python
  for location in root_spec.submodule_search_locations
  ```

- **apps/api/venv/lib/python3.9/site-packages/flask/json/tag.py:140** - Acesso a atributo de relação em loop
  ```python
  return [self.serializer.tag(item) for item in value]
  ```

- **apps/api/venv/lib/python3.9/site-packages/marshmallow/fields.py:233** - Loop com query de relação
  ```python
  for cls in reversed(self.__class__.__mro__):
  ```

- **apps/api/venv/lib/python3.9/site-packages/marshmallow/fields.py:233** - Acesso a atributo de relação em loop
  ```python
  for cls in reversed(self.__class__.__mro__):
  ```

- **apps/api/venv/lib/python3.9/site-packages/marshmallow/validate.py:76** - Acesso a atributo de relação em loop
  ```python
  for validator in self.validators:
  ```

- **apps/api/venv/lib/python3.9/site-packages/marshmallow/class_registry.py:54** - Acesso a atributo de relação em loop
  ```python
  each.__module__ == module for each in _registry[classname]
  ```

- **apps/api/venv/lib/python3.9/site-packages/marshmallow/utils.py:256** - Acesso a atributo de relação em loop
  ```python
  return [d[key] for d in dictlist]
  ```

- **apps/api/venv/lib/python3.9/site-packages/marshmallow/utils.py:305** - Possível acesso a relação em serialização
  ```python
  >>> set_value(d, 'foo.bar', 42)
  ```

- **apps/api/venv/lib/python3.9/site-packages/marshmallow/schema.py:73** - Loop com query de relação
  ```python
  for base in mro[:0:-1]
  ```

- **apps/api/venv/lib/python3.9/site-packages/marshmallow/schema.py:73** - Acesso a atributo de relação em loop
  ```python
  for base in mro[:0:-1]
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/tags.py:105** - Acesso a atributo de relação em loop
  ```python
  for interpreter in interpreters.split("."):
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/tags.py:161** - Possível acesso a relação em serialização
  ```python
  has_ext = "_d.pyd" in EXTENSION_SUFFIXES
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/_musllinux.py:24** - Acesso a atributo de relação em loop
  ```python
  lines = [n for n in (n.strip() for n in output.splitlines()) if n]
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/metadata.py:177** - Loop com query de relação
  ```python
  return [k.strip() for k in data.split(",")]
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/metadata.py:177** - Acesso a atributo de relação em loop
  ```python
  return [k.strip() for k in data.split(",")]
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/metadata.py:466** - Possível acesso a relação em serialização
  ```python
  _VALID_METADATA_VERSIONS = ["1.0", "1.1", "1.2", "2.1", "2.2", "2.3", "2.4"]
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/metadata.py:466** - Possível acesso a relação em serialização
  ```python
  _VALID_METADATA_VERSIONS = ["1.0", "1.1", "1.2", "2.1", "2.2", "2.3", "2.4"]
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/metadata.py:466** - Possível acesso a relação em serialização
  ```python
  _VALID_METADATA_VERSIONS = ["1.0", "1.1", "1.2", "2.1", "2.2", "2.3", "2.4"]
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/metadata.py:466** - Possível acesso a relação em serialização
  ```python
  _VALID_METADATA_VERSIONS = ["1.0", "1.1", "1.2", "2.1", "2.2", "2.3", "2.4"]
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/metadata.py:466** - Possível acesso a relação em serialização
  ```python
  _VALID_METADATA_VERSIONS = ["1.0", "1.1", "1.2", "2.1", "2.2", "2.3", "2.4"]
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/metadata.py:466** - Possível acesso a relação em serialização
  ```python
  _VALID_METADATA_VERSIONS = ["1.0", "1.1", "1.2", "2.1", "2.2", "2.3", "2.4"]
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/metadata.py:466** - Possível acesso a relação em serialização
  ```python
  _VALID_METADATA_VERSIONS = ["1.0", "1.1", "1.2", "2.1", "2.2", "2.3", "2.4"]
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/metadata.py:467** - Possível acesso a relação em serialização
  ```python
  _MetadataVersion = Literal["1.0", "1.1", "1.2", "2.1", "2.2", "2.3", "2.4"]
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/metadata.py:467** - Possível acesso a relação em serialização
  ```python
  _MetadataVersion = Literal["1.0", "1.1", "1.2", "2.1", "2.2", "2.3", "2.4"]
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/metadata.py:467** - Possível acesso a relação em serialização
  ```python
  _MetadataVersion = Literal["1.0", "1.1", "1.2", "2.1", "2.2", "2.3", "2.4"]
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/metadata.py:467** - Possível acesso a relação em serialização
  ```python
  _MetadataVersion = Literal["1.0", "1.1", "1.2", "2.1", "2.2", "2.3", "2.4"]
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/metadata.py:467** - Possível acesso a relação em serialização
  ```python
  _MetadataVersion = Literal["1.0", "1.1", "1.2", "2.1", "2.2", "2.3", "2.4"]
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/metadata.py:467** - Possível acesso a relação em serialização
  ```python
  _MetadataVersion = Literal["1.0", "1.1", "1.2", "2.1", "2.2", "2.3", "2.4"]
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/metadata.py:467** - Possível acesso a relação em serialização
  ```python
  _MetadataVersion = Literal["1.0", "1.1", "1.2", "2.1", "2.2", "2.3", "2.4"]
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/metadata.py:489** - Possível acesso a relação em serialização
  ```python
  added: _MetadataVersion = "1.0",
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/metadata.py:795** - Possível acesso a relação em serialização
  ```python
  added="2.2",
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/metadata.py:801** - Possível acesso a relação em serialização
  ```python
  supported_platforms: _Validator[list[str] | None] = _Validator(added="1.1")
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/metadata.py:807** - Possível acesso a relação em serialização
  ```python
  description_content_type: _Validator[str | None] = _Validator(added="2.1")
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/metadata.py:813** - Possível acesso a relação em serialização
  ```python
  download_url: _Validator[str | None] = _Validator(added="1.1")
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/metadata.py:819** - Possível acesso a relação em serialização
  ```python
  maintainer: _Validator[str | None] = _Validator(added="1.2")
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/metadata.py:821** - Possível acesso a relação em serialização
  ```python
  maintainer_email: _Validator[str | None] = _Validator(added="1.2")
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/metadata.py:826** - Possível acesso a relação em serialização
  ```python
  added="2.4"
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/metadata.py:829** - Possível acesso a relação em serialização
  ```python
  license_files: _Validator[list[str] | None] = _Validator(added="2.4")
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/metadata.py:831** - Possível acesso a relação em serialização
  ```python
  classifiers: _Validator[list[str] | None] = _Validator(added="1.1")
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/metadata.py:834** - Possível acesso a relação em serialização
  ```python
  added="1.2"
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/metadata.py:838** - Possível acesso a relação em serialização
  ```python
  added="1.2"
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/metadata.py:843** - Possível acesso a relação em serialização
  ```python
  requires_external: _Validator[list[str] | None] = _Validator(added="1.2")
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/metadata.py:845** - Possível acesso a relação em serialização
  ```python
  project_urls: _Validator[dict[str, str] | None] = _Validator(added="1.2")
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/metadata.py:850** - Possível acesso a relação em serialização
  ```python
  added="2.1",
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/metadata.py:853** - Possível acesso a relação em serialização
  ```python
  provides_dist: _Validator[list[str] | None] = _Validator(added="1.2")
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/metadata.py:855** - Possível acesso a relação em serialização
  ```python
  obsoletes_dist: _Validator[list[str] | None] = _Validator(added="1.2")
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/metadata.py:857** - Possível acesso a relação em serialização
  ```python
  requires: _Validator[list[str] | None] = _Validator(added="1.1")
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/metadata.py:859** - Possível acesso a relação em serialização
  ```python
  provides: _Validator[list[str] | None] = _Validator(added="1.1")
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/metadata.py:861** - Possível acesso a relação em serialização
  ```python
  obsoletes: _Validator[list[str] | None] = _Validator(added="1.1")
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/version.py:152** - Acesso a atributo de relação em loop
  ```python
  The pattern is not anchored at either end, and is intended for embedding in larger
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/version.py:167** - Possível acesso a relação em serialização
  ```python
  >>> v1 = Version("1.0a5")
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/version.py:168** - Possível acesso a relação em serialização
  ```python
  >>> v2 = Version("1.0")
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/version.py:170** - Possível acesso a relação em serialização
  ```python
  <Version('1.0a5')>
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/version.py:172** - Possível acesso a relação em serialização
  ```python
  <Version('1.0')>
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/version.py:237** - Possível acesso a relação em serialização
  ```python
  >>> str(Version("1.0a5"))
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/version.py:238** - Possível acesso a relação em serialização
  ```python
  '1.0a5'
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/version.py:462** - Possível acesso a relação em serialização
  ```python
  >>> _TrimmedRelease('0.0').release
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/__init__.py:9** - Possível acesso a relação em serialização
  ```python
  __version__ = "25.0"
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/markers.py:157** - Acesso a atributo de relação em loop
  ```python
  inner = (_format_marker(m, first=False) for m in marker)
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/markers.py:110** - Possível acesso a relação em serialização
  ```python
  """The Python version as string ``'major.minor'``."""
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/markers.py:285** - Possível acesso a relação em serialização
  ```python
  # python_version > "3.6" or (python_version == "3.6" and os_name == "unix")
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/markers.py:285** - Possível acesso a relação em serialização
  ```python
  # python_version > "3.6" or (python_version == "3.6" and os_name == "unix")
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/markers.py:289** - Possível acesso a relação em serialização
  ```python
  #     (<Variable('python_version')>, <Op('>')>, <Value('3.6')>),
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/markers.py:292** - Possível acesso a relação em serialização
  ```python
  #         (<Variable('python_version')>, <Op('==')>, <Value('3.6')>),
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/_manylinux.py:69** - Acesso a atributo de relação em loop
  ```python
  return any(arch in allowed_archs for arch in archs)
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/_manylinux.py:138** - Possível acesso a relação em serialização
  ```python
  # Call gnu_get_libc_version, which returns a string like "2.5"
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/specifiers.py:602** - Acesso a atributo de relação em loop
  ```python
  for version in iterable:
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/specifiers.py:551** - Possível acesso a relação em serialização
  ```python
  # "2.0" in Specifier(">=2")
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/specifiers.py:583** - Possível acesso a relação em serialização
  ```python
  >>> list(Specifier(">=1.2.3").filter(["1.2", "1.3", "1.5a1"]))
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/specifiers.py:583** - Possível acesso a relação em serialização
  ```python
  >>> list(Specifier(">=1.2.3").filter(["1.2", "1.3", "1.5a1"]))
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/specifiers.py:583** - Possível acesso a relação em serialização
  ```python
  >>> list(Specifier(">=1.2.3").filter(["1.2", "1.3", "1.5a1"]))
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/specifiers.py:584** - Possível acesso a relação em serialização
  ```python
  ['1.3']
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/specifiers.py:585** - Possível acesso a relação em serialização
  ```python
  >>> list(Specifier(">=1.2.3").filter(["1.2", "1.2.3", "1.3", Version("1.4")]))
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/specifiers.py:585** - Possível acesso a relação em serialização
  ```python
  >>> list(Specifier(">=1.2.3").filter(["1.2", "1.2.3", "1.3", Version("1.4")]))
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/specifiers.py:585** - Possível acesso a relação em serialização
  ```python
  >>> list(Specifier(">=1.2.3").filter(["1.2", "1.2.3", "1.3", Version("1.4")]))
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/specifiers.py:586** - Possível acesso a relação em serialização
  ```python
  ['1.2.3', '1.3', <Version('1.4')>]
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/specifiers.py:586** - Possível acesso a relação em serialização
  ```python
  ['1.2.3', '1.3', <Version('1.4')>]
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/specifiers.py:587** - Possível acesso a relação em serialização
  ```python
  >>> list(Specifier(">=1.2.3").filter(["1.2", "1.5a1"]))
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/specifiers.py:587** - Possível acesso a relação em serialização
  ```python
  >>> list(Specifier(">=1.2.3").filter(["1.2", "1.5a1"]))
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/specifiers.py:588** - Possível acesso a relação em serialização
  ```python
  ['1.5a1']
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/specifiers.py:589** - Possível acesso a relação em serialização
  ```python
  >>> list(Specifier(">=1.2.3").filter(["1.3", "1.5a1"], prereleases=True))
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/specifiers.py:589** - Possível acesso a relação em serialização
  ```python
  >>> list(Specifier(">=1.2.3").filter(["1.3", "1.5a1"], prereleases=True))
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/specifiers.py:590** - Possível acesso a relação em serialização
  ```python
  ['1.3', '1.5a1']
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/specifiers.py:590** - Possível acesso a relação em serialização
  ```python
  ['1.3', '1.5a1']
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/specifiers.py:591** - Possível acesso a relação em serialização
  ```python
  >>> list(Specifier(">=1.2.3", prereleases=True).filter(["1.3", "1.5a1"]))
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/specifiers.py:591** - Possível acesso a relação em serialização
  ```python
  >>> list(Specifier(">=1.2.3", prereleases=True).filter(["1.3", "1.5a1"]))
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/specifiers.py:592** - Possível acesso a relação em serialização
  ```python
  ['1.3', '1.5a1']
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/specifiers.py:592** - Possível acesso a relação em serialização
  ```python
  ['1.3', '1.5a1']
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/specifiers.py:960** - Possível acesso a relação em serialização
  ```python
  >>> list(SpecifierSet(">=1.2.3").filter(["1.2", "1.3", "1.5a1"]))
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/specifiers.py:960** - Possível acesso a relação em serialização
  ```python
  >>> list(SpecifierSet(">=1.2.3").filter(["1.2", "1.3", "1.5a1"]))
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/specifiers.py:960** - Possível acesso a relação em serialização
  ```python
  >>> list(SpecifierSet(">=1.2.3").filter(["1.2", "1.3", "1.5a1"]))
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/specifiers.py:961** - Possível acesso a relação em serialização
  ```python
  ['1.3']
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/specifiers.py:962** - Possível acesso a relação em serialização
  ```python
  >>> list(SpecifierSet(">=1.2.3").filter(["1.2", "1.3", Version("1.4")]))
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/specifiers.py:962** - Possível acesso a relação em serialização
  ```python
  >>> list(SpecifierSet(">=1.2.3").filter(["1.2", "1.3", Version("1.4")]))
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/specifiers.py:962** - Possível acesso a relação em serialização
  ```python
  >>> list(SpecifierSet(">=1.2.3").filter(["1.2", "1.3", Version("1.4")]))
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/specifiers.py:963** - Possível acesso a relação em serialização
  ```python
  ['1.3', <Version('1.4')>]
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/specifiers.py:963** - Possível acesso a relação em serialização
  ```python
  ['1.3', <Version('1.4')>]
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/specifiers.py:964** - Possível acesso a relação em serialização
  ```python
  >>> list(SpecifierSet(">=1.2.3").filter(["1.2", "1.5a1"]))
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/specifiers.py:964** - Possível acesso a relação em serialização
  ```python
  >>> list(SpecifierSet(">=1.2.3").filter(["1.2", "1.5a1"]))
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/specifiers.py:966** - Possível acesso a relação em serialização
  ```python
  >>> list(SpecifierSet(">=1.2.3").filter(["1.3", "1.5a1"], prereleases=True))
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/specifiers.py:966** - Possível acesso a relação em serialização
  ```python
  >>> list(SpecifierSet(">=1.2.3").filter(["1.3", "1.5a1"], prereleases=True))
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/specifiers.py:967** - Possível acesso a relação em serialização
  ```python
  ['1.3', '1.5a1']
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/specifiers.py:967** - Possível acesso a relação em serialização
  ```python
  ['1.3', '1.5a1']
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/specifiers.py:968** - Possível acesso a relação em serialização
  ```python
  >>> list(SpecifierSet(">=1.2.3", prereleases=True).filter(["1.3", "1.5a1"]))
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/specifiers.py:968** - Possível acesso a relação em serialização
  ```python
  >>> list(SpecifierSet(">=1.2.3", prereleases=True).filter(["1.3", "1.5a1"]))
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/specifiers.py:969** - Possível acesso a relação em serialização
  ```python
  ['1.3', '1.5a1']
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/specifiers.py:969** - Possível acesso a relação em serialização
  ```python
  ['1.3', '1.5a1']
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/specifiers.py:974** - Possível acesso a relação em serialização
  ```python
  >>> list(SpecifierSet("").filter(["1.3", "1.5a1"]))
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/specifiers.py:974** - Possível acesso a relação em serialização
  ```python
  >>> list(SpecifierSet("").filter(["1.3", "1.5a1"]))
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/specifiers.py:975** - Possível acesso a relação em serialização
  ```python
  ['1.3']
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/specifiers.py:976** - Possível acesso a relação em serialização
  ```python
  >>> list(SpecifierSet("").filter(["1.5a1"]))
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/specifiers.py:977** - Possível acesso a relação em serialização
  ```python
  ['1.5a1']
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/specifiers.py:978** - Possível acesso a relação em serialização
  ```python
  >>> list(SpecifierSet("", prereleases=True).filter(["1.3", "1.5a1"]))
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/specifiers.py:978** - Possível acesso a relação em serialização
  ```python
  >>> list(SpecifierSet("", prereleases=True).filter(["1.3", "1.5a1"]))
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/specifiers.py:979** - Possível acesso a relação em serialização
  ```python
  ['1.3', '1.5a1']
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/specifiers.py:979** - Possível acesso a relação em serialização
  ```python
  ['1.3', '1.5a1']
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/specifiers.py:980** - Possível acesso a relação em serialização
  ```python
  >>> list(SpecifierSet("").filter(["1.3", "1.5a1"], prereleases=True))
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/specifiers.py:980** - Possível acesso a relação em serialização
  ```python
  >>> list(SpecifierSet("").filter(["1.3", "1.5a1"], prereleases=True))
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/specifiers.py:981** - Possível acesso a relação em serialização
  ```python
  ['1.3', '1.5a1']
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/specifiers.py:981** - Possível acesso a relação em serialização
  ```python
  ['1.3', '1.5a1']
  ```

- **apps/api/venv/lib/python3.9/site-packages/packaging/_elffile.py:99** - Acesso a atributo de relação em loop
  ```python
  for index in range(self._e_phnum):
  ```

- **apps/api/venv/lib/python3.9/site-packages/markupsafe/__init__.py:157** - Acesso a atributo de relação em loop
  ```python
  value = tuple(_MarkupEscapeHelper(x, self.escape) for x in value)
  ```

- **apps/api/venv/lib/python3.9/site-packages/flask_sqlalchemy/track_modifications.py:52** - Acesso a atributo de relação em loop
  ```python
  for target in targets:
  ```

- **apps/api/venv/lib/python3.9/site-packages/flask_sqlalchemy/query.py:15** - Acesso a atributo de relação em loop
  ```python
  useful for querying in a web application.
  ```

- **apps/api/venv/lib/python3.9/site-packages/flask_sqlalchemy/model.py:174** - Loop com query de relação
  ```python
  for arg in args:
  ```

- **apps/api/venv/lib/python3.9/site-packages/flask_sqlalchemy/model.py:174** - Acesso a atributo de relação em loop
  ```python
  for arg in args:
  ```

- **apps/api/venv/lib/python3.9/site-packages/flask_sqlalchemy/extension.py:56** - Loop com query de relação
  ```python
  for b in model_class.__bases__
  ```

- **apps/api/venv/lib/python3.9/site-packages/flask_sqlalchemy/extension.py:56** - Acesso a atributo de relação em loop
  ```python
  for b in model_class.__bases__
  ```

- **apps/api/venv/lib/python3.9/site-packages/flask_sqlalchemy/extension.py:729** - Possível acesso a relação em serialização
  ```python
  " Flask-Migrate or Alembic, you'll need to update your 'env.py' file.",
  ```

- **apps/api/venv/lib/python3.9/site-packages/dotenv/cli.py:84** - Acesso a atributo de relação em loop
  ```python
  for k in sorted(values):
  ```

- **apps/api/venv/lib/python3.9/site-packages/dotenv/main.py:25** - Acesso a atributo de relação em loop
  ```python
  for mapping in mappings:
  ```

- **apps/api/venv/lib/python3.9/site-packages/mako/pyparser.py:74** - Acesso a atributo de relação em loop
  ```python
  for n in node.targets:
  ```

- **apps/api/venv/lib/python3.9/site-packages/mako/cmd.py:86** - Acesso a atributo de relação em loop
  ```python
  kw = dict(varsplit(var) for var in options.var)
  ```

- **apps/api/venv/lib/python3.9/site-packages/mako/util.py:32** - Acesso a atributo de relação em loop
  ```python
  for impl in importlib_metadata_get(self.group):
  ```

- **apps/api/venv/lib/python3.9/site-packages/mako/_ast_util.py:97** - Acesso a atributo de relação em loop
  ```python
  for field in node._fields:
  ```

- **apps/api/venv/lib/python3.9/site-packages/mako/lookup.py:182** - Acesso a atributo de relação em loop
  ```python
  posixpath.normpath(d) for d in util.to_list(directories, ())
  ```

- **apps/api/venv/lib/python3.9/site-packages/mako/lookup.py:105** - Possível acesso a relação em serialização
  ```python
  lookup.put_string("base.html", '''
  ```

- **apps/api/venv/lib/python3.9/site-packages/mako/lookup.py:108** - Possível acesso a relação em serialização
  ```python
  lookup.put_string("hello.html", '''
  ```

- **apps/api/venv/lib/python3.9/site-packages/mako/lookup.py:109** - Possível acesso a relação em serialização
  ```python
  <%include file='base.html'/>
  ```

- **apps/api/venv/lib/python3.9/site-packages/mako/cache.py:9** - Possível acesso a relação em serialização
  ```python
  _cache_plugins = util.PluginLoader("mako.cache")
  ```

- **apps/api/venv/lib/python3.9/site-packages/mako/runtime.py:313** - Loop com query de relação
  ```python
  for i in self._iterable:
  ```

- **apps/api/venv/lib/python3.9/site-packages/mako/runtime.py:313** - Acesso a atributo de relação em loop
  ```python
  for i in self._iterable:
  ```

- **apps/api/venv/lib/python3.9/site-packages/mako/lexer.py:223** - Acesso a atributo de relação em loop
  ```python
  for preproc in self.preprocessor:
  ```

- **apps/api/venv/lib/python3.9/site-packages/mako/template.py:467** - Acesso a atributo de relação em loop
  ```python
  return [i[7:] for i in dir(self.module) if i[:7] == "render_"]
  ```

- **apps/api/venv/lib/python3.9/site-packages/mako/template.py:176** - Possível acesso a relação em serialização
  ```python
  filename="index.html",
  ```

- **apps/api/venv/lib/python3.9/site-packages/mako/template.py:484** - Possível acesso a relação em serialização
  ```python
  f = file("mymodule.py", "w")
  ```

- **apps/api/venv/lib/python3.9/site-packages/mako/exceptions.py:121** - Acesso a atributo de relação em loop
  ```python
  for rec in records:
  ```

- **apps/api/venv/lib/python3.9/site-packages/mako/parsetree.py:41** - Acesso a atributo de relação em loop
  ```python
  for n in node.get_children():
  ```

- **apps/api/venv/lib/python3.9/site-packages/mako/codegen.py:142** - Loop com query de relação
  ```python
  args = [a for a in ["context"] + args]
  ```

- **apps/api/venv/lib/python3.9/site-packages/mako/codegen.py:142** - Acesso a atributo de relação em loop
  ```python
  args = [a for a in ["context"] + args]
  ```

- **apps/api/venv/lib/python3.9/site-packages/mako/filters.py:154** - Possível acesso a relação em serialização
  ```python
  "x": "filters.xml_escape",
  ```

- **apps/api/venv/lib/python3.9/site-packages/mako/filters.py:155** - Possível acesso a relação em serialização
  ```python
  "h": "filters.html_escape",
  ```

- **apps/api/venv/lib/python3.9/site-packages/mako/filters.py:156** - Possível acesso a relação em serialização
  ```python
  "u": "filters.url_escape",
  ```

- **apps/api/venv/lib/python3.9/site-packages/mako/filters.py:157** - Possível acesso a relação em serialização
  ```python
  "trim": "filters.trim",
  ```

- **apps/api/venv/lib/python3.9/site-packages/mako/filters.py:158** - Possível acesso a relação em serialização
  ```python
  "entity": "filters.html_entities_escape",
  ```

- **apps/api/venv/lib/python3.9/site-packages/mako/pygen.py:80** - Acesso a atributo de relação em loop
  ```python
  for line in lines:
  ```

- **apps/api/venv/lib/python3.9/site-packages/mako/ext/linguaplugin.py:27** - Possível acesso a relação em serialização
  ```python
  self.python_extractor = get_extractor("x.py")
  ```

- **apps/api/venv/lib/python3.9/site-packages/mako/ext/autohandler.py:66** - Acesso a atributo de relação em loop
  ```python
  for d in lookup.directories:
  ```

- **apps/api/venv/lib/python3.9/site-packages/mako/ext/extract.py:32** - Acesso a atributo de relação em loop
  ```python
  for node in nodes:
  ```

- **apps/api/venv/lib/python3.9/site-packages/mako/ext/turbogears.py:34** - Acesso a atributo de relação em loop
  ```python
  for kw in compat.inspect_getargspec(Template.__init__)[0]:
  ```

- **apps/api/venv/lib/python3.9/site-packages/mako/testing/exclusions.py:59** - Possível acesso a relação em serialização
  ```python
  _pygments_version() < "1.4", reason="Requires pygments 1.4 or greater"
  ```

- **apps/api/venv/lib/python3.9/site-packages/mako/testing/exclusions.py:66** - Possível acesso a relação em serialização
  ```python
  #         lambda: version < "1.4", "Requires pygments 1.4 or greater"
  ```

- **apps/api/venv/lib/python3.9/site-packages/mako/testing/helpers.py:17** - Acesso a atributo de relação em loop
  ```python
  for x in re.split(r"\r?\n", re.sub(r" +", " ", result))
  ```

- **apps/api/venv/lib/python3.9/site-packages/flask_cors/core.py:83** - Acesso a atributo de relação em loop
  ```python
  return [(re_fix(r), {}) for r in resources]
  ```

- **apps/api/venv/lib/python3.9/site-packages/flake8/discover_files.py:39** - Acesso a atributo de relação em loop
  ```python
  for directory in tuple(sub_directories):
  ```

- **apps/api/venv/lib/python3.9/site-packages/flake8/processor.py:150** - Loop com query de relação
  ```python
  for _ in range(start, token.end[0]):
  ```

- **apps/api/venv/lib/python3.9/site-packages/flake8/processor.py:150** - Acesso a atributo de relação em loop
  ```python
  for _ in range(start, token.end[0]):
  ```

- **apps/api/venv/lib/python3.9/site-packages/flake8/utils.py:41** - Acesso a atributo de relação em loop
  ```python
  item_gen = (item.strip() for item in separated)
  ```

- **apps/api/venv/lib/python3.9/site-packages/flake8/statistics.py:23** - Acesso a atributo de relação em loop
  ```python
  return sorted({key.code for key in self._store})
  ```

- **apps/api/venv/lib/python3.9/site-packages/flake8/style_guide.py:172** - Loop com query de relação
  ```python
  select = next(s for s in self.selected if code.startswith(s))
  ```

- **apps/api/venv/lib/python3.9/site-packages/flake8/style_guide.py:172** - Acesso a atributo de relação em loop
  ```python
  select = next(s for s in self.selected if code.startswith(s))
  ```

- **apps/api/venv/lib/python3.9/site-packages/flake8/checker.py:127** - Acesso a atributo de relação em loop
  ```python
  for statistic in defaults.STATISTIC_NAMES:
  ```

- **apps/api/venv/lib/python3.9/site-packages/flake8/options/config.py:32** - Loop com query de relação
  ```python
  for candidate in ("setup.cfg", "tox.ini", ".flake8"):
  ```

- **apps/api/venv/lib/python3.9/site-packages/flake8/options/config.py:32** - Acesso a atributo de relação em loop
  ```python
  for candidate in ("setup.cfg", "tox.ini", ".flake8"):
  ```

- **apps/api/venv/lib/python3.9/site-packages/flake8/options/config.py:32** - Possível acesso a relação em serialização
  ```python
  for candidate in ("setup.cfg", "tox.ini", ".flake8"):
  ```

- **apps/api/venv/lib/python3.9/site-packages/flake8/options/config.py:32** - Possível acesso a relação em serialização
  ```python
  for candidate in ("setup.cfg", "tox.ini", ".flake8"):
  ```

- **apps/api/venv/lib/python3.9/site-packages/flake8/options/manager.py:132** - Acesso a atributo de relação em loop
  ```python
  for x in (short_option_name, long_option_name)
  ```

- **apps/api/venv/lib/python3.9/site-packages/flake8/options/manager.py:261** - Possível acesso a relação em serialização
  ```python
  if loaded.plugin.entry_point.group == "flake8.extension":
  ```

- **apps/api/venv/lib/python3.9/site-packages/flake8/plugins/finder.py:52** - Acesso a atributo de relação em loop
  ```python
  """Return the name for use in user-facing / error messages."""
  ```

- **apps/api/venv/lib/python3.9/site-packages/flake8/plugins/finder.py:22** - Possível acesso a relação em serialização
  ```python
  FLAKE8_GROUPS = frozenset(("flake8.extension", "flake8.report"))
  ```

- **apps/api/venv/lib/python3.9/site-packages/flake8/plugins/finder.py:22** - Possível acesso a relação em serialização
  ```python
  FLAKE8_GROUPS = frozenset(("flake8.extension", "flake8.report"))
  ```

- **apps/api/venv/lib/python3.9/site-packages/flake8/plugins/finder.py:25** - Possível acesso a relação em serialização
  ```python
  "flake8-colors": "5.0",
  ```

- **apps/api/venv/lib/python3.9/site-packages/flake8/plugins/finder.py:26** - Possível acesso a relação em serialização
  ```python
  "flake8-per-file-ignores": "3.7",
  ```

- **apps/api/venv/lib/python3.9/site-packages/flake8/plugins/finder.py:326** - Possível acesso a relação em serialização
  ```python
  elif loaded.plugin.entry_point.group == "flake8.report":
  ```

- **apps/api/venv/lib/python3.9/site-packages/flake8/plugins/pyflakes.py:80** - Acesso a atributo de relação em loop
  ```python
  for include in self.include_in_doctest
  ```

- **apps/api/venv/lib/python3.9/site-packages/flake8/formatting/default.py:19** - Acesso a atributo de relação em loop
  ```python
  COLORS_OFF = {k: "" for k in COLORS}
  ```

- **apps/api/venv/lib/python3.9/site-packages/flake8/formatting/base.py:118** - Acesso a atributo de relação em loop
  ```python
  for error_code in statistics.error_codes():
  ```

- **apps/api/venv/lib/python3.9/site-packages/flake8/api/legacy.py:64** - Acesso a atributo de relação em loop
  ```python
  for s in self._stats.statistics_for(violation)
  ```

- **apps/api/venv/lib/python3.9/site-packages/flake8/main/application.py:123** - Acesso a atributo de relação em loop
  ```python
  for statistic in defaults.STATISTIC_NAMES + ("files",):
  ```

- **apps/api/venv/lib/python3.9/site-packages/jinja2/compiler.py:134** - Loop com query de relação
  ```python
  return all(has_safe_repr(v) for v in value)
  ```

- **apps/api/venv/lib/python3.9/site-packages/jinja2/compiler.py:134** - Acesso a atributo de relação em loop
  ```python
  return all(has_safe_repr(v) for v in value)
  ```

- **apps/api/venv/lib/python3.9/site-packages/jinja2/compiler.py:219** - Possível acesso a relação em serialização
  ```python
  def copy(self) -> "te.Self":
  ```

- **apps/api/venv/lib/python3.9/site-packages/jinja2/compiler.py:232** - Possível acesso a relação em serialização
  ```python
  def soft(self) -> "te.Self":
  ```

- **apps/api/venv/lib/python3.9/site-packages/jinja2/compiler.py:380** - Possível acesso a relação em serialização
  ```python
  def fail(self, msg: str, lineno: int) -> "te.NoReturn":
  ```

- **apps/api/venv/lib/python3.9/site-packages/jinja2/compiler.py:1425** - Possível acesso a relação em serialização
  ```python
  _PassArg.eval_context: "context.eval_ctx",
  ```

- **apps/api/venv/lib/python3.9/site-packages/jinja2/compiler.py:1817** - Possível acesso a relação em serialização
  ```python
  _PassArg.eval_context: "context.eval_ctx",
  ```

- **apps/api/venv/lib/python3.9/site-packages/jinja2/async_utils.py:77** - Possível acesso a relação em serialização
  ```python
  def __aiter__(self) -> "te.Self":
  ```

- **apps/api/venv/lib/python3.9/site-packages/jinja2/loaders.py:30** - Loop com query de relação
  ```python
  for piece in template.split("/"):
  ```

- **apps/api/venv/lib/python3.9/site-packages/jinja2/loaders.py:30** - Acesso a atributo de relação em loop
  ```python
  for piece in template.split("/"):
  ```

- **apps/api/venv/lib/python3.9/site-packages/jinja2/loaders.py:284** - Possível acesso a relação em serialização
  ```python
  loader = PackageLoader("project.ui", "pages")
  ```

- **apps/api/venv/lib/python3.9/site-packages/jinja2/loaders.py:440** - Possível acesso a relação em serialização
  ```python
  >>> loader = DictLoader({'index.html': 'source here'})
  ```

- **apps/api/venv/lib/python3.9/site-packages/jinja2/loaders.py:467** - Possível acesso a relação em serialização
  ```python
  ...     if name == 'index.html':
  ```

- **apps/api/venv/lib/python3.9/site-packages/jinja2/loaders.py:512** - Possível acesso a relação em serialização
  ```python
  'app1':     PackageLoader('mypackage.app1'),
  ```

- **apps/api/venv/lib/python3.9/site-packages/jinja2/loaders.py:513** - Possível acesso a relação em serialização
  ```python
  'app2':     PackageLoader('mypackage.app2')
  ```

- **apps/api/venv/lib/python3.9/site-packages/jinja2/idtracking.py:20** - Acesso a atributo de relação em loop
  ```python
  for node in nodes:
  ```

- **apps/api/venv/lib/python3.9/site-packages/jinja2/idtracking.py:89** - Possível acesso a relação em serialização
  ```python
  def copy(self) -> "te.Self":
  ```

- **apps/api/venv/lib/python3.9/site-packages/jinja2/runtime.py:81** - Acesso a atributo de relação em loop
  ```python
  for arg in iterator:
  ```

- **apps/api/venv/lib/python3.9/site-packages/jinja2/runtime.py:855** - Possível acesso a relação em serialização
  ```python
  ) -> "te.NoReturn":
  ```

- **apps/api/venv/lib/python3.9/site-packages/jinja2/runtime.py:913** - Possível acesso a relação em serialização
  ```python
  logger: t.Optional["logging.Logger"] = None, base: t.Type[Undefined] = Undefined
  ```

- **apps/api/venv/lib/python3.9/site-packages/jinja2/runtime.py:948** - Possível acesso a relação em serialização
  ```python
  ) -> "te.NoReturn":
  ```

- **apps/api/venv/lib/python3.9/site-packages/jinja2/parser.py:69** - Loop com query de relação
  ```python
  for extension in environment.iter_extensions():
  ```

- **apps/api/venv/lib/python3.9/site-packages/jinja2/parser.py:69** - Acesso a atributo de relação em loop
  ```python
  for extension in environment.iter_extensions():
  ```

- **apps/api/venv/lib/python3.9/site-packages/jinja2/parser.py:81** - Possível acesso a relação em serialização
  ```python
  ) -> "te.NoReturn":
  ```

- **apps/api/venv/lib/python3.9/site-packages/jinja2/parser.py:95** - Possível acesso a relação em serialização
  ```python
  ) -> "te.NoReturn":
  ```

- **apps/api/venv/lib/python3.9/site-packages/jinja2/parser.py:132** - Possível acesso a relação em serialização
  ```python
  ) -> "te.NoReturn":
  ```

- **apps/api/venv/lib/python3.9/site-packages/jinja2/parser.py:143** - Possível acesso a relação em serialização
  ```python
  ) -> "te.NoReturn":
  ```

- **apps/api/venv/lib/python3.9/site-packages/jinja2/utils.py:123** - Acesso a atributo de relação em loop
  ```python
  for _ in iterable:
  ```

- **apps/api/venv/lib/python3.9/site-packages/jinja2/utils.py:467** - Possível acesso a relação em serialização
  ```python
  def copy(self) -> "te.Self":
  ```

- **apps/api/venv/lib/python3.9/site-packages/jinja2/utils.py:655** - Possível acesso a relação em serialização
  ```python
  ``env.policies["json.dumps_function"]``, which defaults to
  ```

- **apps/api/venv/lib/python3.9/site-packages/jinja2/utils.py:658** - Possível acesso a relação em serialização
  ```python
  ``env.policies["json.dumps_kwargs"]``.
  ```

- **apps/api/venv/lib/python3.9/site-packages/jinja2/debug.py:69** - Acesso a atributo de relação em loop
  ```python
  for tb in reversed(stack):
  ```

- **apps/api/venv/lib/python3.9/site-packages/jinja2/lexer.py:146** - Acesso a atributo de relação em loop
  ```python
  f"({'|'.join(re.escape(x) for x in sorted(operators, key=lambda x: -len(x)))})"
  ```

- **apps/api/venv/lib/python3.9/site-packages/jinja2/lexer.py:265** - Possível acesso a relação em serialização
  ```python
  def __call__(self, lineno: int, filename: t.Optional[str]) -> "te.NoReturn":
  ```

- **apps/api/venv/lib/python3.9/site-packages/jinja2/environment.py:117** - Loop com query de relação
  ```python
  for extension in extensions:
  ```

- **apps/api/venv/lib/python3.9/site-packages/jinja2/environment.py:117** - Acesso a atributo de relação em loop
  ```python
  for extension in extensions:
  ```

- **apps/api/venv/lib/python3.9/site-packages/jinja2/environment.py:130** - Possível acesso a relação em serialização
  ```python
  ), "'undefined' must be a subclass of 'jinja2.Undefined'."
  ```

- **apps/api/venv/lib/python3.9/site-packages/jinja2/environment.py:410** - Possível acesso a relação em serialização
  ```python
  ) -> "te.Self":
  ```

- **apps/api/venv/lib/python3.9/site-packages/jinja2/environment.py:936** - Possível acesso a relação em serialização
  ```python
  def handle_exception(self, source: t.Optional[str] = None) -> "te.NoReturn":
  ```

- **apps/api/venv/lib/python3.9/site-packages/jinja2/environment.py:1603** - Possível acesso a relação em serialização
  ```python
  Template('Hello {{ name }}!').stream(name='foo').dump('hello.html')
  ```

- **apps/api/venv/lib/python3.9/site-packages/jinja2/exceptions.py:75** - Acesso a atributo de relação em loop
  ```python
  for name in names:
  ```

- **apps/api/venv/lib/python3.9/site-packages/jinja2/defaults.py:40** - Possível acesso a relação em serialização
  ```python
  "compiler.ascii_str": True,
  ```

- **apps/api/venv/lib/python3.9/site-packages/jinja2/defaults.py:41** - Possível acesso a relação em serialização
  ```python
  "urlize.rel": "noopener",
  ```

- **apps/api/venv/lib/python3.9/site-packages/jinja2/defaults.py:42** - Possível acesso a relação em serialização
  ```python
  "urlize.target": None,
  ```

- **apps/api/venv/lib/python3.9/site-packages/jinja2/defaults.py:43** - Possível acesso a relação em serialização
  ```python
  "urlize.extra_schemes": None,
  ```

- **apps/api/venv/lib/python3.9/site-packages/jinja2/defaults.py:44** - Possível acesso a relação em serialização
  ```python
  "truncate.leeway": 5,
  ```

- **apps/api/venv/lib/python3.9/site-packages/jinja2/defaults.py:45** - Possível acesso a relação em serialização
  ```python
  "json.dumps_function": None,
  ```

- **apps/api/venv/lib/python3.9/site-packages/jinja2/defaults.py:46** - Possível acesso a relação em serialização
  ```python
  "json.dumps_kwargs": {"sort_keys": True},
  ```

- **apps/api/venv/lib/python3.9/site-packages/jinja2/nativetypes.py:37** - Acesso a atributo de relação em loop
  ```python
  raw = "".join([str(v) for v in values])
  ```

- **apps/api/venv/lib/python3.9/site-packages/jinja2/nodes.py:60** - Acesso a atributo de relação em loop
  ```python
  for attr in "fields", "attributes":
  ```

- **apps/api/venv/lib/python3.9/site-packages/jinja2/nodes.py:1056** - Possível acesso a relação em serialização
  ```python
  access.  For example ``ImportedName('cgi.escape')`` returns the `escape`
  ```

- **apps/api/venv/lib/python3.9/site-packages/jinja2/nodes.py:1201** - Possível acesso a relação em serialização
  ```python
  def _failing_new(*args: t.Any, **kwargs: t.Any) -> "te.NoReturn":
  ```

- **apps/api/venv/lib/python3.9/site-packages/jinja2/bccache.py:324** - Loop com query de relação
  ```python
  for filename in files:
  ```

- **apps/api/venv/lib/python3.9/site-packages/jinja2/bccache.py:324** - Acesso a atributo de relação em loop
  ```python
  for filename in files:
  ```

- **apps/api/venv/lib/python3.9/site-packages/jinja2/bccache.py:215** - Possível acesso a relação em serialização
  ```python
  def _unsafe_dir() -> "te.NoReturn":
  ```

- **apps/api/venv/lib/python3.9/site-packages/jinja2/filters.py:72** - Acesso a atributo de relação em loop
  ```python
  for part in parts:
  ```

- **apps/api/venv/lib/python3.9/site-packages/jinja2/filters.py:405** - Possível acesso a relação em serialização
  ```python
  key to sort by. Can use dot notation like ``"address.city"``.
  ```

- **apps/api/venv/lib/python3.9/site-packages/jinja2/filters.py:775** - Possível acesso a relação em serialização
  ```python
  ``env.policies["urlize.extra_schemes"]``, which defaults to no
  ```

- **apps/api/venv/lib/python3.9/site-packages/jinja2/filters.py:798** - Possível acesso a relação em serialização
  ```python
  rel_parts.update((policies["urlize.rel"] or "").split())
  ```

- **apps/api/venv/lib/python3.9/site-packages/jinja2/filters.py:802** - Possível acesso a relação em serialização
  ```python
  target = policies["urlize.target"]
  ```

- **apps/api/venv/lib/python3.9/site-packages/jinja2/filters.py:805** - Possível acesso a relação em serialização
  ```python
  extra_schemes = policies["urlize.extra_schemes"] or ()
  ```

- **apps/api/venv/lib/python3.9/site-packages/jinja2/filters.py:906** - Possível acesso a relação em serialização
  ```python
  leeway = env.policies["truncate.leeway"]
  ```

- **apps/api/venv/lib/python3.9/site-packages/jinja2/filters.py:1000** - Possível acesso a relação em serialização
  ```python
  # this quirk is necessary so that "42.23"|int gives 42.
  ```

- **apps/api/venv/lib/python3.9/site-packages/jinja2/filters.py:1211** - Possível acesso a relação em serialização
  ```python
  nested access, like ``"address.city"``. Unlike Python's ``groupby``,
  ```

- **apps/api/venv/lib/python3.9/site-packages/jinja2/filters.py:1714** - Possível acesso a relação em serialização
  ```python
  dumps = policies["json.dumps_function"]
  ```

- **apps/api/venv/lib/python3.9/site-packages/jinja2/filters.py:1715** - Possível acesso a relação em serialização
  ```python
  kwargs = policies["json.dumps_kwargs"]
  ```

- **apps/api/venv/lib/python3.9/site-packages/jinja2/ext.py:341** - Acesso a atributo de relação em loop
  ```python
  for key in ("gettext", "ngettext", "pgettext", "npgettext"):
  ```

- **apps/api/venv/lib/python3.9/site-packages/jinja2/ext.py:92** - Possível acesso a relação em serialização
  ```python
  def bind(self, environment: Environment) -> "te.Self":
  ```

- **apps/api/venv/lib/python3.9/site-packages/jinja2/meta.py:70** - Possível acesso a relação em serialização
  ```python
  >>> ast = env.parse('{% extends "layout.html" %}{% include helper %}')
  ```

- **apps/api/venv/lib/python3.9/site-packages/jinja2/meta.py:72** - Possível acesso a relação em serialização
  ```python
  ['layout.html', None]
  ```

- **apps/api/venv/lib/python3.9/site-packages/pathspec/util.py:51** - Acesso a atributo de relação em loop
  ```python
  for __sep in [os.sep, os.altsep]
  ```

- **apps/api/venv/lib/python3.9/site-packages/pathspec/pattern.py:66** - Acesso a atributo de relação em loop
  ```python
  for file in files:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pathspec/pathspec.py:144** - Acesso a atributo de relação em loop
  ```python
  for orig_file in files:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pathspec/patterns/gitwildmatch.py:117** - Acesso a atributo de relação em loop
  ```python
  for i in range(len(pattern_segs) - 1, 0, -1):
  ```

- **apps/api/venv/lib/python3.9/site-packages/idna/package_data.py:1** - Possível acesso a relação em serialização
  ```python
  __version__ = "3.10"
  ```

- **apps/api/venv/lib/python3.9/site-packages/idna/core.py:168** - Loop com query de relação
  ```python
  for i in range(pos - 1, -1, -1):
  ```

- **apps/api/venv/lib/python3.9/site-packages/idna/core.py:168** - Acesso a atributo de relação em loop
  ```python
  for i in range(pos - 1, -1, -1):
  ```

- **apps/api/venv/lib/python3.9/site-packages/importlib_metadata/__init__.py:77** - Acesso a atributo de relação em loop
  ```python
  >>> for item in Sectioned.read(Sectioned._sample):
  ```

- **apps/api/venv/lib/python3.9/site-packages/importlib_metadata/__init__.py:154** - Possível acesso a relação em serialização
  ```python
  'package.module'
  ```

- **apps/api/venv/lib/python3.9/site-packages/importlib_metadata/__init__.py:567** - Possível acesso a relação em serialização
  ```python
  return EntryPoints._from_text_for(self.read_text('entry_points.txt'), self)
  ```

- **apps/api/venv/lib/python3.9/site-packages/importlib_metadata/__init__.py:658** - Possível acesso a relação em serialização
  ```python
  text = self.read_text('SOURCES.txt')
  ```

- **apps/api/venv/lib/python3.9/site-packages/importlib_metadata/__init__.py:671** - Possível acesso a relação em serialização
  ```python
  source = self.read_text('requires.txt')
  ```

- **apps/api/venv/lib/python3.9/site-packages/importlib_metadata/__init__.py:715** - Possível acesso a relação em serialização
  ```python
  return self._load_json('direct_url.json')
  ```

- **apps/api/venv/lib/python3.9/site-packages/importlib_metadata/__init__.py:912** - Possível acesso a relação em serialização
  ```python
  'sample__pkg_name.foo'
  ```

- **apps/api/venv/lib/python3.9/site-packages/importlib_metadata/__init__.py:1028** - Possível acesso a relação em serialização
  ```python
  >>> PathDistribution._name_from_stem('foo.bar')
  ```

- **apps/api/venv/lib/python3.9/site-packages/importlib_metadata/__init__.py:1134** - Possível acesso a relação em serialização
  ```python
  return (dist.read_text('top_level.txt') or '').split()
  ```

- **apps/api/venv/lib/python3.9/site-packages/importlib_metadata/__init__.py:1150** - Possível acesso a relação em serialização
  ```python
  >>> _get_toplevel_name(PackagePath('foo.py'))
  ```

- **apps/api/venv/lib/python3.9/site-packages/importlib_metadata/__init__.py:1154** - Possível acesso a relação em serialização
  ```python
  >>> _get_toplevel_name(PackagePath('foo.pyc'))
  ```

- **apps/api/venv/lib/python3.9/site-packages/importlib_metadata/__init__.py:1158** - Possível acesso a relação em serialização
  ```python
  >>> _get_toplevel_name(PackagePath('foo.pth'))
  ```

- **apps/api/venv/lib/python3.9/site-packages/importlib_metadata/__init__.py:1159** - Possível acesso a relação em serialização
  ```python
  'foo.pth'
  ```

- **apps/api/venv/lib/python3.9/site-packages/importlib_metadata/_functools.py:25** - Acesso a atributo de relação em loop
  ```python
  >>> for x in range(75):
  ```

- **apps/api/venv/lib/python3.9/site-packages/importlib_metadata/_itertools.py:12** - Acesso a atributo de relação em loop
  ```python
  for element in filterfalse(seen.__contains__, iterable):
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/_reloader.py:43** - Loop com query de relação
  ```python
  for module in list(sys.modules.values()):
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/_reloader.py:43** - Acesso a atributo de relação em loop
  ```python
  for module in list(sys.modules.values()):
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/_reloader.py:416** - Possível acesso a relação em serialização
  ```python
  __import__("watchdog.observers")
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/serving.py:333** - Loop com query de relação
  ```python
  for data in application_iter:
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/serving.py:333** - Acesso a atributo de relação em loop
  ```python
  for data in application_iter:
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/serving.py:84** - Possível acesso a relação em serialização
  ```python
  t.Union["ssl.SSLContext", tuple[str, t.Optional[str]], t.Literal["adhoc"]]
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/serving.py:187** - Possível acesso a relação em serialização
  ```python
  "wsgi.version": (1, 0),
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/serving.py:188** - Possível acesso a relação em serialização
  ```python
  "wsgi.url_scheme": url_scheme,
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/serving.py:189** - Possível acesso a relação em serialização
  ```python
  "wsgi.input": self.rfile,
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/serving.py:190** - Possível acesso a relação em serialização
  ```python
  "wsgi.errors": sys.stderr,
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/serving.py:191** - Possível acesso a relação em serialização
  ```python
  "wsgi.multithread": self.server.multithread,
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/serving.py:192** - Possível acesso a relação em serialização
  ```python
  "wsgi.multiprocess": self.server.multiprocess,
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/serving.py:193** - Possível acesso a relação em serialização
  ```python
  "wsgi.run_once": False,
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/serving.py:194** - Possível acesso a relação em serialização
  ```python
  "werkzeug.socket": self.connection,
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/serving.py:224** - Possível acesso a relação em serialização
  ```python
  environ["wsgi.input_terminated"] = True
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/serving.py:225** - Possível acesso a relação em serialização
  ```python
  environ["wsgi.input"] = DechunkedInput(environ["wsgi.input"])
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/serving.py:225** - Possível acesso a relação em serialização
  ```python
  environ["wsgi.input"] = DechunkedInput(environ["wsgi.input"])
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/local.py:224** - Acesso a atributo de relação em loop
  ```python
  for local in self.locals:
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/security.py:13** - Acesso a atributo de relação em loop
  ```python
  sep for sep in [os.sep, os.path.altsep] if sep is not None and sep != "/"
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/test.py:169** - Loop com query de relação
  ```python
  for v in value:
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/test.py:169** - Acesso a atributo de relação em loop
  ```python
  for v in value:
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/test.py:411** - Possível acesso a relação em serialização
  ```python
  environ["wsgi.url_scheme"],
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/test.py:417** - Possível acesso a relação em serialização
  ```python
  "input_stream": environ["wsgi.input"],
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/test.py:420** - Possível acesso a relação em serialização
  ```python
  "errors_stream": environ["wsgi.errors"],
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/test.py:421** - Possível acesso a relação em serialização
  ```python
  "multithread": environ["wsgi.multithread"],
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/test.py:422** - Possível acesso a relação em serialização
  ```python
  "multiprocess": environ["wsgi.multiprocess"],
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/test.py:423** - Possível acesso a relação em serialização
  ```python
  "run_once": environ["wsgi.run_once"],
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/test.py:721** - Possível acesso a relação em serialização
  ```python
  "wsgi.version": self.wsgi_version,
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/test.py:722** - Possível acesso a relação em serialização
  ```python
  "wsgi.url_scheme": self.url_scheme,
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/test.py:723** - Possível acesso a relação em serialização
  ```python
  "wsgi.input": input_stream,
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/test.py:724** - Possível acesso a relação em serialização
  ```python
  "wsgi.errors": self.errors_stream,
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/test.py:725** - Possível acesso a relação em serialização
  ```python
  "wsgi.multithread": self.multithread,
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/test.py:726** - Possível acesso a relação em serialização
  ```python
  "wsgi.multiprocess": self.multiprocess,
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/test.py:727** - Possível acesso a relação em serialização
  ```python
  "wsgi.run_once": self.run_once,
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/formparser.py:287** - Possível acesso a relação em serialização
  ```python
  errors="werkzeug.url_quote",
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/utils.py:42** - Acesso a atributo de relação em loop
  ```python
  *(f"COM{i}" for i in range(10)),
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/utils.py:205** - Possível acesso a relação em serialização
  ```python
  'My_cool_movie.mov'
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/utils.py:209** - Possível acesso a relação em serialização
  ```python
  'i_contain_cool_umlauts.txt'
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/http.py:282** - Acesso a atributo de relação em loop
  ```python
  items = [quote_header_value(x) for x in iterable]
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/http.py:573** - Possível acesso a relação em serialização
  ```python
  _TAnyAccept = t.TypeVar("_TAnyAccept", bound="ds.Accept")
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/http.py:685** - Possível acesso a relação em serialização
  ```python
  _TAnyCSP = t.TypeVar("_TAnyCSP", bound="ds.ContentSecurityPolicy")
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/http.py:1263** - Possível acesso a relação em serialização
  ```python
  example, ``domain="example.com"`` will set a cookie
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/exceptions.py:321** - Acesso a atributo de relação em loop
  ```python
  headers.extend(("WWW-Authenticate", str(x)) for x in self.www_authenticate)
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/urls.py:34** - Acesso a atributo de relação em loop
  ```python
  choices = "|".join(f"{ord(c):02X}" for c in sorted(chars))
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/urls.py:26** - Possível acesso a relação em serialização
  ```python
  codecs.register_error("werkzeug.url_quote", _codec_error_url_quote)
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/urls.py:42** - Possível acesso a relação em serialização
  ```python
  out.append(unquote(part, "utf-8", "werkzeug.url_quote"))
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/wsgi.py:259** - Acesso a atributo de relação em loop
  ```python
  for callback in self._callbacks:
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/wsgi.py:53** - Possível acesso a relação em serialização
  ```python
  "scheme": environ["wsgi.url_scheme"],
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/wsgi.py:107** - Possível acesso a relação em serialização
  ```python
  environ["wsgi.url_scheme"],
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/wsgi.py:140** - Possível acesso a relação em serialização
  ```python
  If the WSGI server sets ``environ["wsgi.input_terminated"]``, it indicates that the
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/wsgi.py:168** - Possível acesso a relação em serialização
  ```python
  stream = t.cast(t.IO[bytes], environ["wsgi.input"])
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/wsgi.py:177** - Possível acesso a relação em serialização
  ```python
  if "wsgi.input_terminated" in environ:
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/wsgi.py:281** - Possível acesso a relação em serialização
  ```python
  return environ.get("wsgi.file_wrapper", FileWrapper)(  # type: ignore
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/testapp.py:110** - Acesso a atributo de relação em loop
  ```python
  for item in sys.path:
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/middleware/proxy_fix.py:135** - Possível acesso a relação em serialização
  ```python
  orig_wsgi_url_scheme = environ_get("wsgi.url_scheme")
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/middleware/proxy_fix.py:141** - Possível acesso a relação em serialização
  ```python
  "wsgi.url_scheme": orig_wsgi_url_scheme,
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/middleware/proxy_fix.py:158** - Possível acesso a relação em serialização
  ```python
  environ["wsgi.url_scheme"] = x_proto
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/middleware/profiler.py:53** - Possível acesso a relação em serialização
  ```python
  will also have the ``"werkzeug.profiler"`` key populated with a
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/middleware/profiler.py:75** - Possível acesso a relação em serialização
  ```python
  Added the ``"werkzeug.profiler"`` key to the ``filename_format(environ)``
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/middleware/profiler.py:131** - Possível acesso a relação em serialização
  ```python
  environ["werkzeug.profiler"] = {
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/middleware/lint.py:114** - Acesso a atributo de relação em loop
  ```python
  for line in seq:
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/middleware/lint.py:94** - Possível acesso a relação em serialização
  ```python
  warn("'wsgi.input' is not iterable.", WSGIWarning, stacklevel=2)
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/middleware/lint.py:264** - Possível acesso a relação em serialização
  ```python
  "wsgi.version",
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/middleware/lint.py:265** - Possível acesso a relação em serialização
  ```python
  "wsgi.input",
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/middleware/lint.py:266** - Possível acesso a relação em serialização
  ```python
  "wsgi.errors",
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/middleware/lint.py:267** - Possível acesso a relação em serialização
  ```python
  "wsgi.multithread",
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/middleware/lint.py:268** - Possível acesso a relação em serialização
  ```python
  "wsgi.multiprocess",
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/middleware/lint.py:269** - Possível acesso a relação em serialização
  ```python
  "wsgi.run_once",
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/middleware/lint.py:277** - Possível acesso a relação em serialização
  ```python
  if environ["wsgi.version"] != (1, 0):
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/middleware/lint.py:399** - Possível acesso a relação em serialização
  ```python
  environ["wsgi.input"] = InputStream(environ["wsgi.input"])
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/middleware/lint.py:399** - Possível acesso a relação em serialização
  ```python
  environ["wsgi.input"] = InputStream(environ["wsgi.input"])
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/middleware/lint.py:400** - Possível acesso a relação em serialização
  ```python
  environ["wsgi.errors"] = ErrorStream(environ["wsgi.errors"])
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/middleware/lint.py:400** - Possível acesso a relação em serialização
  ```python
  environ["wsgi.errors"] = ErrorStream(environ["wsgi.errors"])
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/middleware/lint.py:404** - Possível acesso a relação em serialização
  ```python
  environ["wsgi.file_wrapper"] = FileWrapper
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/wrappers/request.py:469** - Acesso a atributo de relação em loop
  ```python
  for d in sources:
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/wrappers/request.py:47** - Possível acesso a relação em serialização
  ```python
  as ``environ['werkzeug.request']``. Can be useful when
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/wrappers/request.py:121** - Possível acesso a relação em serialização
  ```python
  scheme=environ.get("wsgi.url_scheme", "http"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/wrappers/request.py:133** - Possível acesso a relação em serialização
  ```python
  self.environ["werkzeug.request"] = self
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/wrappers/request.py:356** - Possível acesso a relação em serialização
  ```python
  "wsgi.input",
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/wrappers/request.py:521** - Possível acesso a relação em serialização
  ```python
  "wsgi.multithread",
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/wrappers/request.py:526** - Possível acesso a relação em serialização
  ```python
  "wsgi.multiprocess",
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/wrappers/request.py:531** - Possível acesso a relação em serialização
  ```python
  "wsgi.run_once",
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/wrappers/response.py:32** - Loop com query de relação
  ```python
  for item in iterable:
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/wrappers/response.py:32** - Acesso a atributo de relação em loop
  ```python
  for item in iterable:
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/sansio/multipart.py:240** - Acesso a atributo de relação em loop
  ```python
  for line in data.splitlines():
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/sansio/request.py:175** - Possível acesso a relação em serialização
  ```python
  errors="werkzeug.url_quote",
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/sansio/response.py:610** - Loop com query de relação
  ```python
  for item in value[1:]:
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/sansio/response.py:610** - Acesso a atributo de relação em loop
  ```python
  for item in value[1:]:
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/sansio/response.py:216** - Possível acesso a relação em serialização
  ```python
  ``domain="example.com"`` will set a cookie that is
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/sansio/utils.py:31** - Acesso a atributo de relação em loop
  ```python
  for ref in trusted_list:
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/datastructures/structures.py:37** - Acesso a atributo de relação em loop
  ```python
  for v in value:
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/datastructures/headers.py:413** - Acesso a atributo de relação em loop
  ```python
  self._list[idx + 1 :] = [t for t in iter_list if t[0].lower() != ikey]
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/datastructures/headers.py:349** - Possível acesso a relação em serialização
  ```python
  >>> d.add('Content-Disposition', 'attachment', filename='foo.png')
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/routing/matcher.py:40** - Acesso a atributo de relação em loop
  ```python
  for part in rule._parts:
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/routing/__init__.py:41** - Possível acesso a relação em serialização
  ```python
  c = m.bind('example.com')
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/routing/__init__.py:58** - Possível acesso a relação em serialização
  ```python
  c = m.bind('example.com', subdomain='kb')
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/routing/__init__.py:70** - Possível acesso a relação em serialização
  ```python
  c = m.bind('example.com', '/applications/example')
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/routing/__init__.py:80** - Possível acesso a relação em serialização
  ```python
  c = m.bind('example.com')
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/routing/__init__.py:88** - Possível acesso a relação em serialização
  ```python
  c = m.bind('example.com', '/', 'kb')
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/routing/rules.py:102** - Acesso a atributo de relação em loop
  ```python
  for convert in int, float:
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/routing/map.py:123** - Loop com query de relação
  ```python
  for rulefactory in rules or ():
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/routing/map.py:123** - Acesso a atributo de relação em loop
  ```python
  for rulefactory in rules or ():
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/routing/map.py:268** - Possível acesso a relação em serialização
  ```python
  Example: `server_name` is ``'example.com'`` and the `SERVER_NAME`
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/routing/map.py:270** - Possível acesso a relação em serialização
  ```python
  subdomain will be ``'staging.dev'``.
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/routing/map.py:301** - Possível acesso a relação em serialização
  ```python
  scheme = env["wsgi.url_scheme"]
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/routing/map.py:544** - Possível acesso a relação em serialização
  ```python
  >>> urls = m.bind("example.com", "/")
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/routing/map.py:851** - Possível acesso a relação em serialização
  ```python
  >>> urls = m.bind("example.com", "/")
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/debug/console.py:121** - Acesso a atributo de relação em loop
  ```python
  for var in code.co_consts:
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/debug/tbtools.py:270** - Loop com query de relação
  ```python
  for f in te.stack
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/debug/tbtools.py:270** - Acesso a atributo de relação em loop
  ```python
  for f in te.stack
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/debug/__init__.py:61** - Loop com query de relação
  ```python
  for filename in "/etc/machine-id", "/proc/sys/kernel/random/boot_id":
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/debug/__init__.py:61** - Acesso a atributo de relação em loop
  ```python
  for filename in "/etc/machine-id", "/proc/sys/kernel/random/boot_id":
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/debug/__init__.py:273** - Possível acesso a relação em serialização
  ```python
  request_key: str = "werkzeug.request",
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/debug/__init__.py:372** - Possível acesso a relação em serialização
  ```python
  environ["wsgi.errors"].write(
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/debug/__init__.py:378** - Possível acesso a relação em serialização
  ```python
  environ["wsgi.errors"].write("".join(tb.render_traceback_text()))
  ```

- **apps/api/venv/lib/python3.9/site-packages/werkzeug/debug/repr.py:86** - Acesso a atributo de relação em loop
  ```python
  for cls in base:
  ```

- **apps/api/venv/lib/python3.9/site-packages/click/_winconsole.py:200** - Acesso a atributo de relação em loop
  ```python
  for line in lines:
  ```

- **apps/api/venv/lib/python3.9/site-packages/click/core.py:61** - Loop com query de relação
  ```python
  for name in multi.list_commands(ctx):
  ```

- **apps/api/venv/lib/python3.9/site-packages/click/core.py:61** - Acesso a atributo de relação em loop
  ```python
  for name in multi.list_commands(ctx):
  ```

- **apps/api/venv/lib/python3.9/site-packages/click/core.py:685** - Possível acesso a relação em serialização
  ```python
  def fail(self, message: str) -> "te.NoReturn":
  ```

- **apps/api/venv/lib/python3.9/site-packages/click/core.py:693** - Possível acesso a relação em serialização
  ```python
  def abort(self) -> "te.NoReturn":
  ```

- **apps/api/venv/lib/python3.9/site-packages/click/core.py:697** - Possível acesso a relação em serialização
  ```python
  def exit(self, code: int = 0) -> "te.NoReturn":
  ```

- **apps/api/venv/lib/python3.9/site-packages/click/core.py:1002** - Possível acesso a relação em serialização
  ```python
  ) -> "te.NoReturn": ...
  ```

- **apps/api/venv/lib/python3.9/site-packages/click/types.py:277** - Acesso a atributo de relação em loop
  ```python
  normed_choices = {choice: choice for choice in self.choices}
  ```

- **apps/api/venv/lib/python3.9/site-packages/click/types.py:135** - Possível acesso a relação em serialização
  ```python
  ) -> "t.NoReturn":
  ```

- **apps/api/venv/lib/python3.9/site-packages/click/formatting.py:15** - Acesso a atributo de relação em loop
  ```python
  for row in rows:
  ```

- **apps/api/venv/lib/python3.9/site-packages/click/parser.py:86** - Loop com query de relação
  ```python
  x = [_fetch(args) for _ in range(nargs)]
  ```

- **apps/api/venv/lib/python3.9/site-packages/click/parser.py:86** - Acesso a atributo de relação em loop
  ```python
  x = [_fetch(args) for _ in range(nargs)]
  ```

- **apps/api/venv/lib/python3.9/site-packages/click/termui.py:276** - Acesso a atributo de relação em loop
  ```python
  text_generator = (el if isinstance(el, str) else str(el) for el in i)
  ```

- **apps/api/venv/lib/python3.9/site-packages/click/utils.py:523** - Acesso a atributo de relação em loop
  ```python
  """Determine the command used to run the program, for use in help
  ```

- **apps/api/venv/lib/python3.9/site-packages/click/utils.py:36** - Possível acesso a relação em serialização
  ```python
  def wrapper(*args: "P.args", **kwargs: "P.kwargs") -> t.Optional[R]:
  ```

- **apps/api/venv/lib/python3.9/site-packages/click/utils.py:36** - Possível acesso a relação em serialização
  ```python
  def wrapper(*args: "P.args", **kwargs: "P.kwargs") -> t.Optional[R]:
  ```

- **apps/api/venv/lib/python3.9/site-packages/click/utils.py:568** - Possível acesso a relação em serialização
  ```python
  # A submodule like "example.cli".
  ```

- **apps/api/venv/lib/python3.9/site-packages/click/exceptions.py:20** - Acesso a atributo de relação em loop
  ```python
  return " / ".join(repr(x) for x in param_hint)
  ```

- **apps/api/venv/lib/python3.9/site-packages/click/shell_completion.py:101** - Loop com query de relação
  ```python
  for completion in $response; do
  ```

- **apps/api/venv/lib/python3.9/site-packages/click/shell_completion.py:101** - Acesso a atributo de relação em loop
  ```python
  for completion in $response; do
  ```

- **apps/api/venv/lib/python3.9/site-packages/click/_compat.py:386** - Acesso a atributo de relação em loop
  ```python
  if any(m in mode for m in ["w", "a", "x"]):
  ```

- **apps/api/venv/lib/python3.9/site-packages/click/_termui_impl.py:346** - Loop com query de relação
  ```python
  for rv in self.iter:
  ```

- **apps/api/venv/lib/python3.9/site-packages/click/_termui_impl.py:346** - Acesso a atributo de relação em loop
  ```python
  for rv in self.iter:
  ```

- **apps/api/venv/lib/python3.9/site-packages/click/testing.py:46** - Loop com query de relação
  ```python
  return [self._echo(x) for x in self._input.readlines()]
  ```

- **apps/api/venv/lib/python3.9/site-packages/click/testing.py:46** - Acesso a atributo de relação em loop
  ```python
  return [self._echo(x) for x in self._input.readlines()]
  ```

- **apps/api/venv/lib/python3.9/site-packages/click/decorators.py:32** - Possível acesso a relação em serialização
  ```python
  def new_func(*args: "P.args", **kwargs: "P.kwargs") -> "R":
  ```

- **apps/api/venv/lib/python3.9/site-packages/click/decorators.py:32** - Possível acesso a relação em serialização
  ```python
  def new_func(*args: "P.args", **kwargs: "P.kwargs") -> "R":
  ```

- **apps/api/venv/lib/python3.9/site-packages/click/decorators.py:44** - Possível acesso a relação em serialização
  ```python
  def new_func(*args: "P.args", **kwargs: "P.kwargs") -> "R":
  ```

- **apps/api/venv/lib/python3.9/site-packages/click/decorators.py:44** - Possível acesso a relação em serialização
  ```python
  def new_func(*args: "P.args", **kwargs: "P.kwargs") -> "R":
  ```

- **apps/api/venv/lib/python3.9/site-packages/click/decorators.py:76** - Possível acesso a relação em serialização
  ```python
  def new_func(*args: "P.args", **kwargs: "P.kwargs") -> "R":
  ```

- **apps/api/venv/lib/python3.9/site-packages/click/decorators.py:76** - Possível acesso a relação em serialização
  ```python
  def new_func(*args: "P.args", **kwargs: "P.kwargs") -> "R":
  ```

- **apps/api/venv/lib/python3.9/site-packages/click/decorators.py:115** - Possível acesso a relação em serialização
  ```python
  def new_func(*args: "P.args", **kwargs: "P.kwargs") -> R:
  ```

- **apps/api/venv/lib/python3.9/site-packages/click/decorators.py:115** - Possível acesso a relação em serialização
  ```python
  def new_func(*args: "P.args", **kwargs: "P.kwargs") -> R:
  ```

- **apps/api/venv/lib/python3.9/site-packages/zipp/__init__.py:116** - Acesso a atributo de relação em loop
  ```python
  as_dirs = (p + posixpath.sep for p in parents)
  ```

- **apps/api/venv/lib/python3.9/site-packages/zipp/__init__.py:226** - Possível acesso a relação em serialização
  ```python
  >>> zf.writestr('a.txt', 'content of a')
  ```

- **apps/api/venv/lib/python3.9/site-packages/zipp/__init__.py:241** - Possível acesso a relação em serialização
  ```python
  Path('mem/abcde.zip', 'a.txt')
  ```

- **apps/api/venv/lib/python3.9/site-packages/zipp/__init__.py:252** - Possível acesso a relação em serialização
  ```python
  >>> c = b / 'c.txt'
  ```

- **apps/api/venv/lib/python3.9/site-packages/zipp/__init__.py:256** - Possível acesso a relação em serialização
  ```python
  'c.txt'
  ```

- **apps/api/venv/lib/python3.9/site-packages/zipp/__init__.py:267** - Possível acesso a relação em serialização
  ```python
  >>> (b / 'missing.txt').exists()
  ```

- **apps/api/venv/lib/python3.9/site-packages/zipp/__init__.py:282** - Possível acesso a relação em serialização
  ```python
  'abcde.zip'
  ```

- **apps/api/venv/lib/python3.9/site-packages/gunicorn/reloader.py:31** - Acesso a atributo de relação em loop
  ```python
  for module in tuple(sys.modules.values())
  ```

- **apps/api/venv/lib/python3.9/site-packages/gunicorn/config.py:31** - Loop com query de relação
  ```python
  for s in KNOWN_SETTINGS:
  ```

- **apps/api/venv/lib/python3.9/site-packages/gunicorn/config.py:31** - Acesso a atributo de relação em loop
  ```python
  for s in KNOWN_SETTINGS:
  ```

- **apps/api/venv/lib/python3.9/site-packages/gunicorn/config.py:163** - Possível acesso a relação em serialização
  ```python
  section="gunicorn.loggers")
  ```

- **apps/api/venv/lib/python3.9/site-packages/gunicorn/util.py:62** - Acesso a atributo de relação em loop
  ```python
  eps = [ep for ep in dist_obj.entry_points
  ```

- **apps/api/venv/lib/python3.9/site-packages/gunicorn/util.py:70** - Possível acesso a relação em serialização
  ```python
  section="gunicorn.workers"):
  ```

- **apps/api/venv/lib/python3.9/site-packages/gunicorn/sock.py:155** - Acesso a atributo de relação em loop
  ```python
  fdaddr = [bind for bind in addr if isinstance(bind, int)]
  ```

- **apps/api/venv/lib/python3.9/site-packages/gunicorn/arbiter.py:45** - Loop com query de relação
  ```python
  for x in "HUP QUIT INT TERM TTIN TTOU USR1 USR2 WINCH".split()]
  ```

- **apps/api/venv/lib/python3.9/site-packages/gunicorn/arbiter.py:45** - Acesso a atributo de relação em loop
  ```python
  for x in "HUP QUIT INT TERM TTIN TTOU USR1 USR2 WINCH".split()]
  ```

- **apps/api/venv/lib/python3.9/site-packages/gunicorn/arbiter.py:129** - Possível acesso a relação em serialização
  ```python
  self.master_name = "Master.2"
  ```

- **apps/api/venv/lib/python3.9/site-packages/gunicorn/arbiter.py:583** - Possível acesso a relação em serialização
  ```python
  extra={"metric": "gunicorn.workers",
  ```

- **apps/api/venv/lib/python3.9/site-packages/gunicorn/glogging.py:93** - Loop com query de relação
  ```python
  return [logging.getLogger(name) for name in existing]
  ```

- **apps/api/venv/lib/python3.9/site-packages/gunicorn/glogging.py:93** - Acesso a atributo de relação em loop
  ```python
  return [logging.getLogger(name) for name in existing]
  ```

- **apps/api/venv/lib/python3.9/site-packages/gunicorn/glogging.py:53** - Possível acesso a relação em serialização
  ```python
  "gunicorn.error": {
  ```

- **apps/api/venv/lib/python3.9/site-packages/gunicorn/glogging.py:57** - Possível acesso a relação em serialização
  ```python
  "qualname": "gunicorn.error"
  ```

- **apps/api/venv/lib/python3.9/site-packages/gunicorn/glogging.py:60** - Possível acesso a relação em serialização
  ```python
  "gunicorn.access": {
  ```

- **apps/api/venv/lib/python3.9/site-packages/gunicorn/glogging.py:64** - Possível acesso a relação em serialização
  ```python
  "qualname": "gunicorn.access"
  ```

- **apps/api/venv/lib/python3.9/site-packages/gunicorn/glogging.py:69** - Possível acesso a relação em serialização
  ```python
  "class": "logging.StreamHandler",
  ```

- **apps/api/venv/lib/python3.9/site-packages/gunicorn/glogging.py:74** - Possível acesso a relação em serialização
  ```python
  "class": "logging.StreamHandler",
  ```

- **apps/api/venv/lib/python3.9/site-packages/gunicorn/glogging.py:83** - Possível acesso a relação em serialização
  ```python
  "class": "logging.Formatter"
  ```

- **apps/api/venv/lib/python3.9/site-packages/gunicorn/glogging.py:185** - Possível acesso a relação em serialização
  ```python
  self.error_log = logging.getLogger("gunicorn.error")
  ```

- **apps/api/venv/lib/python3.9/site-packages/gunicorn/glogging.py:187** - Possível acesso a relação em serialização
  ```python
  self.access_log = logging.getLogger("gunicorn.access")
  ```

- **apps/api/venv/lib/python3.9/site-packages/gunicorn/app/base.py:231** - Acesso a atributo de relação em loop
  ```python
  for path in paths:
  ```

- **apps/api/venv/lib/python3.9/site-packages/gunicorn/instrument/statsd.py:104** - Possível acesso a relação em serialização
  ```python
  self.increment("gunicorn.requests", 1)
  ```

- **apps/api/venv/lib/python3.9/site-packages/gunicorn/http/message.py:67** - Acesso a atributo de relação em loop
  ```python
  lines = [bytes_to_str(line) + "\r\n" for line in data.split(b"\r\n")]
  ```

- **apps/api/venv/lib/python3.9/site-packages/gunicorn/http/wsgi.py:55** - Loop com query de relação
  ```python
  for h in handlers:
  ```

- **apps/api/venv/lib/python3.9/site-packages/gunicorn/http/wsgi.py:55** - Acesso a atributo de relação em loop
  ```python
  for h in handlers:
  ```

- **apps/api/venv/lib/python3.9/site-packages/gunicorn/http/wsgi.py:47** - Possível acesso a relação em serialização
  ```python
  errorlog = logging.getLogger("gunicorn.error")
  ```

- **apps/api/venv/lib/python3.9/site-packages/gunicorn/http/wsgi.py:70** - Possível acesso a relação em serialização
  ```python
  "wsgi.errors": WSGIErrorsWrapper(cfg),
  ```

- **apps/api/venv/lib/python3.9/site-packages/gunicorn/http/wsgi.py:71** - Possível acesso a relação em serialização
  ```python
  "wsgi.version": (1, 0),
  ```

- **apps/api/venv/lib/python3.9/site-packages/gunicorn/http/wsgi.py:72** - Possível acesso a relação em serialização
  ```python
  "wsgi.multithread": False,
  ```

- **apps/api/venv/lib/python3.9/site-packages/gunicorn/http/wsgi.py:73** - Possível acesso a relação em serialização
  ```python
  "wsgi.multiprocess": (cfg.workers > 1),
  ```

- **apps/api/venv/lib/python3.9/site-packages/gunicorn/http/wsgi.py:74** - Possível acesso a relação em serialização
  ```python
  "wsgi.run_once": False,
  ```

- **apps/api/venv/lib/python3.9/site-packages/gunicorn/http/wsgi.py:75** - Possível acesso a relação em serialização
  ```python
  "wsgi.file_wrapper": FileWrapper,
  ```

- **apps/api/venv/lib/python3.9/site-packages/gunicorn/http/wsgi.py:76** - Possível acesso a relação em serialização
  ```python
  "wsgi.input_terminated": True,
  ```

- **apps/api/venv/lib/python3.9/site-packages/gunicorn/http/wsgi.py:84** - Possível acesso a relação em serialização
  ```python
  "wsgi.input": req.body,
  ```

- **apps/api/venv/lib/python3.9/site-packages/gunicorn/http/wsgi.py:85** - Possível acesso a relação em serialização
  ```python
  "gunicorn.socket": sock,
  ```

- **apps/api/venv/lib/python3.9/site-packages/gunicorn/http/wsgi.py:142** - Possível acesso a relação em serialização
  ```python
  environ['wsgi.url_scheme'] = req.scheme
  ```

- **apps/api/venv/lib/python3.9/site-packages/gunicorn/workers/sync.py:99** - Acesso a atributo de relação em loop
  ```python
  for listener in ready:
  ```

- **apps/api/venv/lib/python3.9/site-packages/gunicorn/workers/sync.py:180** - Possível acesso a relação em serialização
  ```python
  if isinstance(respiter, environ['wsgi.file_wrapper']):
  ```

- **apps/api/venv/lib/python3.9/site-packages/gunicorn/workers/base_async.py:115** - Acesso a atributo de relação em loop
  ```python
  for item in respiter:
  ```

- **apps/api/venv/lib/python3.9/site-packages/gunicorn/workers/base_async.py:98** - Possível acesso a relação em serialização
  ```python
  environ["wsgi.multithread"] = True
  ```

- **apps/api/venv/lib/python3.9/site-packages/gunicorn/workers/base_async.py:112** - Possível acesso a relação em serialização
  ```python
  if isinstance(respiter, environ['wsgi.file_wrapper']):
  ```

- **apps/api/venv/lib/python3.9/site-packages/gunicorn/workers/gtornado.py:74** - Acesso a atributo de relação em loop
  ```python
  for callback in self.callbacks:
  ```

- **apps/api/venv/lib/python3.9/site-packages/gunicorn/workers/gtornado.py:35** - Possível acesso a relação em serialização
  ```python
  web = sys.modules.pop("tornado.web")
  ```

- **apps/api/venv/lib/python3.9/site-packages/gunicorn/workers/gtornado.py:43** - Possível acesso a relação em serialização
  ```python
  sys.modules["tornado.web"] = web
  ```

- **apps/api/venv/lib/python3.9/site-packages/gunicorn/workers/gtornado.py:121** - Possível acesso a relação em serialização
  ```python
  httpserver = sys.modules["tornado.httpserver"]
  ```

- **apps/api/venv/lib/python3.9/site-packages/gunicorn/workers/gtornado.py:129** - Possível acesso a relação em serialização
  ```python
  sys.modules["tornado.httpserver"] = httpserver
  ```

- **apps/api/venv/lib/python3.9/site-packages/gunicorn/workers/geventlet.py:161** - Acesso a atributo de relação em loop
  ```python
  for sock in self.sockets:
  ```

- **apps/api/venv/lib/python3.9/site-packages/gunicorn/workers/ggevent.py:43** - Acesso a atributo de relação em loop
  ```python
  for s in self.sockets:
  ```

- **apps/api/venv/lib/python3.9/site-packages/gunicorn/workers/ggevent.py:18** - Possível acesso a relação em serialização
  ```python
  if parse_version(gevent.__version__) < parse_version('1.4'):
  ```

- **apps/api/venv/lib/python3.9/site-packages/gunicorn/workers/ggevent.py:70** - Possível acesso a relação em serialização
  ```python
  "wsgi.multithread": True,
  ```

- **apps/api/venv/lib/python3.9/site-packages/gunicorn/workers/ggevent.py:178** - Possível acesso a relação em serialização
  ```python
  env['gunicorn.sock'] = self.socket
  ```

- **apps/api/venv/lib/python3.9/site-packages/gunicorn/workers/gthread.py:196** - Acesso a atributo de relação em loop
  ```python
  for sock in self.sockets:
  ```

- **apps/api/venv/lib/python3.9/site-packages/gunicorn/workers/gthread.py:321** - Possível acesso a relação em serialização
  ```python
  environ["wsgi.multithread"] = True
  ```

- **apps/api/venv/lib/python3.9/site-packages/gunicorn/workers/gthread.py:336** - Possível acesso a relação em serialização
  ```python
  if isinstance(respiter, environ['wsgi.file_wrapper']):
  ```

- **apps/api/venv/lib/python3.9/site-packages/gunicorn/workers/base.py:31** - Acesso a atributo de relação em loop
  ```python
  SIGNALS = [getattr(signal, "SIG%s" % x) for x in (
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/exc.py:201** - Loop com query de relação
  ```python
  message += " (%s)" % ", ".join(repr(s) for s in cycles)
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/exc.py:201** - Acesso a atributo de relação em loop
  ```python
  message += " (%s)" % ", ".join(repr(s) for s in cycles)
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/exc.py:802** - Possível acesso a relação em serialização
  ```python
  deprecated_since: Optional[str] = "1.4"
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/connectors/aioodbc.py:106** - Loop com query de relação
  ```python
  for name in (
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/connectors/aioodbc.py:106** - Acesso a atributo de relação em loop
  ```python
  for name in (
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/connectors/pyodbc.py:38** - Acesso a atributo de relação em loop
  ```python
  # this is no longer False for pyodbc in general
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/util/topological.py:42** - Acesso a atributo de relação em loop
  ```python
  for node in todo:
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/util/deprecations.py:157** - Possível acesso a relação em serialização
  ```python
  "2.0", message=message, warning=exc.MovedIn20Warning, **kw
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/util/deprecations.py:196** - Possível acesso a relação em serialização
  ```python
  return deprecated("2.0", message=message, warning=warning_cls, **kw)
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/util/deprecations.py:206** - Possível acesso a relação em serialização
  ```python
  "0.7",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/util/deprecations.py:289** - Possível acesso a relação em serialização
  ```python
  % ("1.4" if version == "2.0" else version, (message or ""))
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/util/deprecations.py:289** - Possível acesso a relação em serialização
  ```python
  % ("1.4" if version == "2.0" else version, (message or ""))
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/util/_collections.py:117** - Loop com query de relação
  ```python
  for element in current:
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/util/_collections.py:117** - Acesso a atributo de relação em loop
  ```python
  for element in current:
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/util/langhelpers.py:179** - Loop com query de relação
  ```python
  n.lower() for n in re.findall(r"([A-Z][a-z]+|SQL)", cls.__name__)
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/util/langhelpers.py:179** - Acesso a atributo de relação em loop
  ```python
  n.lower() for n in re.findall(r"([A-Z][a-z]+|SQL)", cls.__name__)
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/util/langhelpers.py:915** - Possível acesso a relação em serialização
  ```python
  name="self.proxy",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/util/langhelpers.py:2069** - Possível acesso a relação em serialização
  ```python
  >>> quoted_token_parser("schema.name")
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/util/typing.py:188** - Acesso a atributo de relação em loop
  ```python
  for elem in annotation.__args__
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/util/tool_support.py:91** - Acesso a atributo de relação em loop
  ```python
  for entry in compat.importlib_metadata_get("console_scripts"):
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/util/tool_support.py:44** - Possível acesso a relação em serialização
  ```python
  self.pyproject_toml_path = self.source_root / Path("pyproject.toml")
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/util/_py_collections.py:130** - Acesso a atributo de relação em loop
  ```python
  for d in dicts:
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/ext/instrumentation.py:104** - Loop com query de relação
  ```python
  for finder in instrumentation_finders:
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/ext/instrumentation.py:104** - Acesso a atributo de relação em loop
  ```python
  for finder in instrumentation_finders:
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/ext/compiler.py:498** - Loop com query de relação
  ```python
  for s in specs:
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/ext/compiler.py:498** - Acesso a atributo de relação em loop
  ```python
  for s in specs:
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/ext/compiler.py:296** - Possível acesso a relação em serialização
  ```python
  key=('0', <class '__main__.MyColumn'>,
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/ext/orderinglist.py:147** - Acesso a atributo de relação em loop
  ```python
  """Prepares an :class:`OrderingList` factory for use in mapper definitions.
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/ext/orderinglist.py:35** - Possível acesso a relação em serialização
  ```python
  bullets = relationship("Bullet", order_by="Bullet.position")
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/ext/orderinglist.py:40** - Possível acesso a relação em serialização
  ```python
  slide_id = Column(Integer, ForeignKey('slide.id'))
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/ext/orderinglist.py:66** - Possível acesso a relação em serialização
  ```python
  bullets = relationship("Bullet", order_by="Bullet.position",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/ext/orderinglist.py:72** - Possível acesso a relação em serialização
  ```python
  slide_id = Column(Integer, ForeignKey('slide.id'))
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/ext/orderinglist.py:160** - Possível acesso a relação em serialização
  ```python
  bullets = relationship("Bullet", order_by="Bullet.position",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/ext/hybrid.py:549** - Acesso a atributo de relação em loop
  ```python
  return sum((acc.balance for acc in self.accounts), start=Decimal("0"))
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/ext/hybrid.py:417** - Possível acesso a relação em serialização
  ```python
  user_id: Mapped[int] = mapped_column(ForeignKey('user.id'))
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/ext/hybrid.py:533** - Possível acesso a relação em serialização
  ```python
  user_id: Mapped[int] = mapped_column(ForeignKey('user.id'))
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/ext/__init__.py:11** - Possível acesso a relação em serialização
  ```python
  _sa_util.preloaded.import_prefix("sqlalchemy.ext")
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/ext/indexable.py:289** - Acesso a atributo de relação em loop
  ```python
  self.datatype = lambda: [None for x in range(index + 1)]
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/ext/baked.py:198** - Loop com query de relação
  ```python
  for opt in options:
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/ext/baked.py:198** - Acesso a atributo de relação em loop
  ```python
  for opt in options:
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/ext/automap.py:1184** - Acesso a atributo de relação em loop
  ```python
  for mr in cls.__mro__:
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/ext/automap.py:116** - Possível acesso a relação em serialização
  ```python
  Column('user_id', ForeignKey('user.id'))
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/ext/automap.py:184** - Possível acesso a relação em serialização
  ```python
  return f"mymodule.default"
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/ext/automap.py:494** - Possível acesso a relação em serialização
  ```python
  id = Column(Integer, ForeignKey('employee.id'), primary_key=True)
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/ext/automap.py:521** - Possível acesso a relação em serialização
  ```python
  id = Column(Integer, ForeignKey('employee.id'), primary_key=True)
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/ext/automap.py:522** - Possível acesso a relação em serialização
  ```python
  favorite_employee_id = Column(Integer, ForeignKey('employee.id'))
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/ext/automap.py:586** - Possível acesso a relação em serialização
  ```python
  _table_a = Column('table_a', ForeignKey('table_a.id'))
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/ext/automap.py:617** - Possível acesso a relação em serialização
  ```python
  user_id = Column(ForeignKey('user.id'))
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/ext/automap.py:1056** - Possível acesso a relação em serialização
  ```python
  "2.0",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/ext/automap.py:1064** - Possível acesso a relação em serialização
  ```python
  "2.0",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/ext/horizontal_shard.py:253** - Acesso a atributo de relação em loop
  ```python
  for k in shards:
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/ext/horizontal_shard.py:200** - Possível acesso a relação em serialização
  ```python
  "2.0",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/ext/horizontal_shard.py:230** - Possível acesso a relação em serialização
  ```python
  "1.4",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/ext/mutable.py:558** - Loop com query de relação
  ```python
  for val in collection:
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/ext/mutable.py:558** - Acesso a atributo de relação em loop
  ```python
  for val in collection:
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/ext/associationproxy.py:1448** - Acesso a atributo de relação em loop
  ```python
  return [self._get(member) for member in self.col[index]]
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/ext/mypy/util.py:54** - Loop com query de relação
  ```python
  [int(x) for x in version.__version__.split(".") if re.match(r"^\d+$", x)]
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/ext/mypy/util.py:54** - Acesso a atributo de relação em loop
  ```python
  [int(x) for x in version.__version__.split(".") if re.match(r"^\d+$", x)]
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/ext/mypy/util.py:254** - Possível acesso a relação em serialização
  ```python
  and stmt.expr[0].fullname == "typing.TYPE_CHECKING"
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/ext/mypy/names.py:220** - Acesso a atributo de relação em loop
  ```python
  for mr in info.mro:
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/ext/mypy/names.py:56** - Possível acesso a relação em serialização
  ```python
  NAMED_TYPE_BUILTINS_OBJECT = "builtins.object"
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/ext/mypy/names.py:57** - Possível acesso a relação em serialização
  ```python
  NAMED_TYPE_BUILTINS_STR = "builtins.str"
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/ext/mypy/names.py:58** - Possível acesso a relação em serialização
  ```python
  NAMED_TYPE_BUILTINS_LIST = "builtins.list"
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/ext/mypy/plugin.py:180** - Acesso a atributo de relação em loop
  ```python
  for decorator in ctx.cls.decorators:
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/ext/mypy/plugin.py:130** - Possível acesso a relação em serialização
  ```python
  (10, "sqlalchemy.orm", -1),
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/ext/mypy/plugin.py:292** - Possível acesso a relação em serialização
  ```python
  util.add_global(ctx, "sqlalchemy.orm", "Mapped", "__sa_Mapped")
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/ext/mypy/infer.py:407** - Acesso a atributo de relação em loop
  ```python
  for column_arg in right_hand_expression.args[0:2]:
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/ext/mypy/infer.py:569** - Possível acesso a relação em serialização
  ```python
  if base_.fullname == "enum.Enum":
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/ext/mypy/decl_class.py:95** - Loop com query de relação
  ```python
  for stmt in util.flatten_typechecking(cls.defs.body):
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/ext/mypy/decl_class.py:95** - Acesso a atributo de relação em loop
  ```python
  for stmt in util.flatten_typechecking(cls.defs.body):
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/ext/mypy/apply.py:58** - Acesso a atributo de relação em loop
  ```python
  for stmt in cls.defs.body:
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/ext/declarative/extensions.py:104** - Loop com query de relação
  ```python
  (mp.polymorphic_identity, mp.local_table) for mp in mappers
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/ext/declarative/extensions.py:104** - Acesso a atributo de relação em loop
  ```python
  (mp.polymorphic_identity, mp.local_table) for mp in mappers
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/ext/declarative/extensions.py:214** - Possível acesso a relação em serialização
  ```python
  return Column(ForeignKey('company.id'))
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/ext/asyncio/session.py:129** - Acesso a atributo de relação em loop
  ```python
  for b1 in await a1.awaitable_attrs.bs:
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/ext/asyncio/session.py:114** - Possível acesso a relação em serialização
  ```python
  a_id: Mapped[int] = mapped_column(ForeignKey("a.id"))
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/ext/asyncio/session.py:1068** - Possível acesso a relação em serialização
  ```python
  "2.0",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/ext/asyncio/result.py:174** - Acesso a atributo de relação em loop
  ```python
  async for partition in result.partitions(100):
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/ext/asyncio/engine.py:548** - Acesso a atributo de relação em loop
  ```python
  async for row in result:
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/testing/exclusions.py:53** - Acesso a atributo de relação em loop
  ```python
  for other in others:
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/testing/config.py:175** - Loop com query de relação
  ```python
  for casename in case_names:
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/testing/config.py:175** - Acesso a atributo de relação em loop
  ```python
  for casename in case_names:
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/testing/engines.py:72** - Acesso a atributo de relação em loop
  ```python
  for rec in list(self.proxy_refs):
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/testing/util.py:61** - Acesso a atributo de relação em loop
  ```python
  for pickle_ in picklers:
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/testing/util.py:229** - Possível acesso a relação em serialização
  ```python
  # as the provide_metadata fixture is often used with "testing.db",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/testing/assertions.py:183** - Acesso a atributo de relação em loop
  ```python
  filters = [re.compile(msg, re.I | re.S) for msg in messages]
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/testing/assertions.py:239** - Possível acesso a relação em serialização
  ```python
  with mock.patch("warnings.warn", our_warn):
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/testing/assertions.py:594** - Possível acesso a relação em serialização
  ```python
  "compiler.current_executable"
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/testing/assertions.py:647** - Possível acesso a relação em serialização
  ```python
  # are the "self.statement" element
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/testing/assertsql.py:157** - Acesso a atributo de relação em loop
  ```python
  for m in parameters
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/testing/provision.py:40** - Acesso a atributo de relação em loop
  ```python
  for dbname in dbnames:
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/testing/requirements.py:1164** - Possível acesso a relação em serialização
  ```python
  expr = decimal.Decimal("15.7563")
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/testing/entities.py:34** - Acesso a atributo de relação em loop
  ```python
  for key in sorted(self.__dict__.keys())
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/testing/profiling.py:101** - Acesso a atributo de relação em loop
  ```python
  py_version = ".".join([str(v) for v in sys.version_info[0:2]])
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/testing/schema.py:29** - Loop com query de relação
  ```python
  test_opts = {k: kw.pop(k) for k in list(kw) if k.startswith("test_")}
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/testing/schema.py:29** - Acesso a atributo de relação em loop
  ```python
  test_opts = {k: kw.pop(k) for k in list(kw) if k.startswith("test_")}
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/testing/plugin/plugin_base.py:284** - Loop com query de relação
  ```python
  for fn in pre_configure:
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/testing/plugin/plugin_base.py:284** - Acesso a atributo de relação em loop
  ```python
  for fn in pre_configure:
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/testing/plugin/plugin_base.py:276** - Possível acesso a relação em serialização
  ```python
  [str(root_path / "setup.cfg"), str(root_path / "test.cfg")]
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/testing/plugin/plugin_base.py:276** - Possível acesso a relação em serialização
  ```python
  [str(root_path / "setup.cfg"), str(root_path / "test.cfg")]
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/testing/plugin/plugin_base.py:385** - Possível acesso a relação em serialização
  ```python
  "sqlite.pysqlite_numeric",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/testing/plugin/plugin_base.py:390** - Possível acesso a relação em serialização
  ```python
  "sqlite.pysqlite_dollar",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/testing/plugin/pytestplugin.py:82** - Loop com query de relação
  ```python
  + [f"not {tag}" for tag in plugin_base.exclude_tags]
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/testing/plugin/pytestplugin.py:82** - Acesso a atributo de relação em loop
  ```python
  + [f"not {tag}" for tag in plugin_base.exclude_tags]
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/testing/fixtures/mypy.py:135** - Acesso a atributo de relação em loop
  ```python
  for extra_dir in config.options.mypy_extra_test_paths:
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/testing/fixtures/mypy.py:43** - Possível acesso a relação em serialização
  ```python
  Path(cachedir) / "sqla_mypy_config.cfg", "w"
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/testing/fixtures/mypy.py:59** - Possível acesso a relação em serialização
  ```python
  Path(cachedir) / "plain_mypy_config.cfg", "w"
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/testing/fixtures/mypy.py:89** - Possível acesso a relação em serialização
  ```python
  "sqla_mypy_config.cfg"
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/testing/fixtures/mypy.py:91** - Possível acesso a relação em serialização
  ```python
  else "plain_mypy_config.cfg",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/testing/fixtures/mypy.py:187** - Possível acesso a relação em serialização
  ```python
  "List", "builtins.list", expected_msg
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/testing/fixtures/sql.py:147** - Loop com query de relação
  ```python
  for table in reversed(
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/testing/fixtures/sql.py:147** - Acesso a atributo de relação em loop
  ```python
  for table in reversed(
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/testing/fixtures/base.py:97** - Acesso a atributo de relação em loop
  ```python
  for r in to_consume:
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/dialects/__init__.py:59** - Possível acesso a relação em serialização
  ```python
  registry = util.PluginLoader("sqlalchemy.dialects", auto_fn=_auto_fn)
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/dialects/__init__.py:61** - Possível acesso a relação em serialização
  ```python
  plugins = util.PluginLoader("sqlalchemy.plugins")
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py:319** - Loop com query de relação
  ```python
  tokens = [str(elem) for elem in value]
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py:319** - Acesso a atributo de relação em loop
  ```python
  tokens = [str(elem) for elem in value]
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/dialects/postgresql/psycopg2cffi.py:17** - Acesso a atributo de relação em loop
  ```python
  layer. This makes it suitable for use in e.g. PyPy. Documentation
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/dialects/postgresql/psycopg.py:213** - Loop com query de relação
  ```python
  for element in cast("Iterable[ranges.Range]", value)
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/dialects/postgresql/psycopg.py:213** - Acesso a atributo de relação em loop
  ```python
  for element in cast("Iterable[ranges.Range]", value)
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/dialects/postgresql/psycopg2.py:580** - Acesso a atributo de relação em loop
  ```python
  for notice in cursor.connection.notices:
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/dialects/postgresql/provision.py:91** - Acesso a atributo de relação em loop
  ```python
  for xid in conn.exec_driver_sql(
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/dialects/postgresql/pg8000.py:290** - Acesso a atributo de relação em loop
  ```python
  for v in value:
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/dialects/postgresql/array.py:108** - Acesso a atributo de relação em loop
  ```python
  self._type_tuple = [arg.type for arg in self.clauses]
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/dialects/postgresql/named_types.py:362** - Acesso a atributo de relação em loop
  ```python
  """dont return dbapi.STRING for ENUM in PostgreSQL, since that's
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/dialects/postgresql/base.py:1860** - Acesso a atributo de relação em loop
  ```python
  for type_ in element_types or [INTEGER()]
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/dialects/postgresql/base.py:454** - Possível acesso a relação em serialização
  ```python
  >>> metadata_obj.tables['test_schema.referred'].schema
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/dialects/postgresql/base.py:1188** - Possível acesso a relação em serialização
  ```python
  ForeignKeyConstraint(["some_id"], ["some_table.some_id"], postgresql_not_valid=True)
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/dialects/postgresql/ext.py:322** - Acesso a atributo de relação em loop
  ```python
  for c in args
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/dialects/oracle/provision.py:66** - Acesso a atributo de relação em loop
  ```python
  for syn in conn.dialect._get_synonyms(conn, None, None, None):
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/dialects/oracle/cx_oracle.py:772** - Acesso a atributo de relação em loop
  ```python
  for bindparam in self.compiled.binds.values():
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/dialects/oracle/cx_oracle.py:1020** - Possível acesso a relação em serialização
  ```python
  "1.3",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/dialects/oracle/cx_oracle.py:1321** - Possível acesso a relação em serialização
  ```python
  version="1.3",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/dialects/oracle/base.py:907** - Loop com query de relação
  ```python
  for j in join.left, join.right:
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/dialects/oracle/base.py:907** - Acesso a atributo de relação em loop
  ```python
  for j in join.left, join.right:
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/dialects/oracle/base.py:1444** - Possível acesso a relação em serialização
  ```python
  "1.4",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/dialects/sqlite/aiosqlite.py:315** - Acesso a atributo de relação em loop
  ```python
  for name in (
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/dialects/sqlite/provision.py:51** - Acesso a atributo de relação em loop
  ```python
  for token in tokens:
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/dialects/sqlite/base.py:745** - Loop com query de relação
  ```python
  assert [c[0] for c in cursor.description] == ['a', 'b']
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/dialects/sqlite/base.py:745** - Acesso a atributo de relação em loop
  ```python
  assert [c[0] for c in cursor.description] == ['a', 'b']
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/dialects/sqlite/base.py:758** - Possível acesso a relação em serialização
  ```python
  File "test.py", line 19, in <module>
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/dialects/sqlite/base.py:760** - Possível acesso a relação em serialização
  ```python
  AssertionError: ['x.a', 'x.b']
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/dialects/sqlite/base.py:760** - Possível acesso a relação em serialização
  ```python
  AssertionError: ['x.a', 'x.b']
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/dialects/sqlite/base.py:796** - Possível acesso a relação em serialização
  ```python
  >>> row["x.a"]
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/dialects/sqlite/base.py:800** - Possível acesso a relação em serialização
  ```python
  >>> row["x.b"]
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/dialects/sqlite/base.py:816** - Possível acesso a relação em serialização
  ```python
  assert result.keys() == ["x.a", "x.b"]
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/dialects/sqlite/base.py:816** - Possível acesso a relação em serialização
  ```python
  assert result.keys() == ["x.a", "x.b"]
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/dialects/sqlite/base.py:1883** - Possível acesso a relação em serialização
  ```python
  # "tablename.colname", or if using an attached database,
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/dialects/sqlite/pysqlite.py:438** - Loop com query de relação
  ```python
  for i in range(5):
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/dialects/sqlite/pysqlite.py:438** - Acesso a atributo de relação em loop
  ```python
  for i in range(5):
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/dialects/mysql/enumerated.py:160** - Acesso a atributo de relação em loop
  ```python
  length = max([len(v) for v in values] + [0])
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/dialects/mysql/mysqlconnector.py:137** - Acesso a atributo de relação em loop
  ```python
  return tuple(int(x) for x in m.group(1, 2, 3) if x is not None)
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/dialects/mysql/asyncmy.py:247** - Loop com query de relação
  ```python
  for name in (
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/dialects/mysql/asyncmy.py:247** - Acesso a atributo de relação em loop
  ```python
  for name in (
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/dialects/mysql/aiomysql.py:227** - Loop com query de relação
  ```python
  for name in (
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/dialects/mysql/aiomysql.py:227** - Acesso a atributo de relação em loop
  ```python
  for name in (
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/dialects/mysql/reflection.py:46** - Acesso a atributo de relação em loop
  ```python
  for line in re.split(r"\r?\n", show_create):
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/dialects/mysql/mariadbconnector.py:141** - Acesso a atributo de relação em loop
  ```python
  for x in re.findall(
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/dialects/mysql/types.py:387** - Acesso a atributo de relação em loop
  ```python
  for i in value:
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/dialects/mysql/mysqldb.py:137** - Acesso a atributo de relação em loop
  ```python
  return tuple(int(x) for x in m.group(1, 2, 3) if x is not None)
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/dialects/mysql/mysqldb.py:144** - Possível acesso a relação em serialização
  ```python
  cursors = __import__("MySQLdb.cursors").cursors
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/dialects/mysql/pymysql.py:67** - Possível acesso a relação em serialização
  ```python
  cursors = __import__("pymysql.cursors").cursors
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/dialects/mysql/pymysql.py:89** - Possível acesso a relação em serialização
  ```python
  Connection = __import__("pymysql.connections").Connection
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/dialects/mysql/base.py:1191** - Loop com query de relação
  ```python
  for entry in cast(
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/dialects/mysql/base.py:1191** - Acesso a atributo de relação em loop
  ```python
  for entry in cast(
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/dialects/mysql/base.py:807** - Possível acesso a relação em serialização
  ```python
  ForeignKeyConstraint(['other_id'], ['othertable.other_id']),
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/dialects/mysql/base.py:1585** - Possível acesso a relação em serialização
  ```python
  version="1.4",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/dialects/mysql/cymysql.py:38** - Acesso a atributo de relação em loop
  ```python
  for i in iter(value):
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/dialects/mssql/provision.py:68** - Acesso a atributo de relação em loop
  ```python
  # for row in conn.exec_driver_sql(
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/dialects/mssql/information_schema.py:107** - Possível acesso a relação em serialização
  ```python
  schema="tempdb.INFORMATION_SCHEMA",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/dialects/mssql/pyodbc.py:408** - Acesso a atributo de relação em loop
  ```python
  "".join([str(nint) for nint in value.as_tuple()[1]]),
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/dialects/mssql/base.py:1244** - Loop com query de relação
  ```python
  return datetime.date(*[int(x or 0) for x in m.groups()])
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/dialects/mssql/base.py:1244** - Acesso a atributo de relação em loop
  ```python
  return datetime.date(*[int(x or 0) for x in m.groups()])
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/dialects/mssql/base.py:653** - Possível acesso a relação em serialização
  ```python
  schema="mydatabase.dbo"
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/dialects/mssql/base.py:667** - Possível acesso a relação em serialização
  ```python
  schema="MyDataBase.dbo"
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/dialects/mssql/base.py:715** - Possível acesso a relação em serialização
  ```python
  this legacy mode of rendering would assume that "customer_schema.account"
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/dialects/mssql/base.py:2614** - Possível acesso a relação em serialização
  ```python
  "1.4",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/dialects/mssql/base.py:2858** - Possível acesso a relação em serialização
  ```python
  version="1.3",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/dialects/mssql/base.py:3138** - Possível acesso a relação em serialização
  ```python
  "1.4",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/dialects/mssql/base.py:3192** - Possível acesso a relação em serialização
  ```python
  view_name = "sys.system_views"
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/dialects/mssql/base.py:3423** - Possível acesso a relação em serialização
  ```python
  "ind.filter_definition"
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/sync.py:51** - Possível acesso a relação em serialização
  ```python
  # technically the "r.primary_key" check isn't
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/interfaces.py:1004** - Acesso a atributo de relação em loop
  ```python
  for path_key in (
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/interfaces.py:236** - Possível acesso a relação em serialização
  ```python
  "2.0",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/interfaces.py:1337** - Possível acesso a relação em serialização
  ```python
  "1.4",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/decl_base.py:174** - Loop com query de relação
  ```python
  for base_ in cls.__bases__:
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/decl_base.py:174** - Acesso a atributo de relação em loop
  ```python
  for base_ in cls.__bases__:
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/decl_base.py:231** - Possível acesso a relação em serialização
  ```python
  # rather than just a simple "cls._sa_class_manager"
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/decl_base.py:1125** - Possível acesso a relação em serialização
  ```python
  "2.0",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/instrumentation.py:162** - Loop com query de relação
  ```python
  for mgr in cast(
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/instrumentation.py:162** - Acesso a atributo de relação em loop
  ```python
  for mgr in cast(
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/instrumentation.py:134** - Possível acesso a relação em serialização
  ```python
  "1.4",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/instrumentation.py:143** - Possível acesso a relação em serialização
  ```python
  "1.4",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/loading.py:115** - Loop com query de relação
  ```python
  for query_entity in context.compile_state._entities
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/loading.py:115** - Acesso a atributo de relação em loop
  ```python
  for query_entity in context.compile_state._entities
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/loading.py:1179** - Possível acesso a relação em serialização
  ```python
  # and add to the "context.partials" collection.
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/persistence.py:53** - Loop com query de relação
  ```python
  for state in _sort_states(base_mapper, states):
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/persistence.py:53** - Acesso a atributo de relação em loop
  ```python
  for state in _sort_states(base_mapper, states):
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/path_registry.py:239** - Acesso a atributo de relação em loop
  ```python
  for i in range(0, len(odd_path), 2):
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/query.py:295** - Loop com query de relação
  ```python
  for ent in util.to_list(entities)
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/query.py:295** - Acesso a atributo de relação em loop
  ```python
  for ent in util.to_list(entities)
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/query.py:751** - Possível acesso a relação em serialização
  ```python
  "1.4",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/query.py:1435** - Possível acesso a relação em serialização
  ```python
  "1.4",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/query.py:1461** - Possível acesso a relação em serialização
  ```python
  "1.4",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/query.py:1639** - Possível acesso a relação em serialização
  ```python
  "1.4",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/query.py:2934** - Possível acesso a relação em serialização
  ```python
  "2.0",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/query.py:2955** - Possível acesso a relação em serialização
  ```python
  version="1.4",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/query.py:3333** - Possível acesso a relação em serialização
  ```python
  "1.4",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/attributes.py:229** - Loop com query de relação
  ```python
  for base in manager._bases:
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/attributes.py:229** - Acesso a atributo de relação em loop
  ```python
  for base in manager._bases:
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/strategies.py:118** - Loop com query de relação
  ```python
  for m in mapper.self_and_descendants:
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/strategies.py:118** - Acesso a atributo de relação em loop
  ```python
  for m in mapper.self_and_descendants:
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/strategy_options.py:772** - Loop com query de relação
  ```python
  sorted((inspect(cls) for cls in classes), key=id)
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/strategy_options.py:772** - Acesso a atributo de relação em loop
  ```python
  sorted((inspect(cls) for cls in classes), key=id)
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/strategy_options.py:147** - Possível acesso a relação em serialização
  ```python
  version="1.4",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/strategy_options.py:2280** - Possível acesso a relação em serialização
  ```python
  version="1.4",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/strategy_options.py:2450** - Possível acesso a relação em serialização
  ```python
  version="1.3",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/strategy_options.py:2468** - Possível acesso a relação em serialização
  ```python
  version="1.3",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/properties.py:163** - Loop com query de relação
  ```python
  coercions.expect(roles.LabeledColumnExprRole, c) for c in columns
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/properties.py:163** - Acesso a atributo de relação em loop
  ```python
  coercions.expect(roles.LabeledColumnExprRole, c) for c in columns
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/util.py:240** - Loop com query de relação
  ```python
  for x in sorted(
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/util.py:240** - Acesso a atributo de relação em loop
  ```python
  for x in sorted(
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/util.py:445** - Possível acesso a relação em serialização
  ```python
  (<class '__main__.MyClass'>, (1, 2), None)
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/util.py:465** - Possível acesso a relação em serialização
  ```python
  (<class '__main__.MyClass'>, (1, 2), None)
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/util.py:485** - Possível acesso a relação em serialização
  ```python
  (<class '__main__.MyClass'>, (1, 2), None)
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/events.py:331** - Acesso a atributo de relação em loop
  ```python
  for mgr in target.subclass_managers(True):
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/events.py:264** - Possível acesso a relação em serialização
  ```python
  @util.preload_module("sqlalchemy.orm")
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/events.py:284** - Possível acesso a relação em serialização
  ```python
  "2.0",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/events.py:819** - Possível acesso a relação em serialização
  ```python
  @util.preload_module("sqlalchemy.orm")
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/events.py:832** - Possível acesso a relação em serialização
  ```python
  "2.0",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/events.py:2098** - Possível acesso a relação em serialização
  ```python
  "0.9",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/events.py:2144** - Possível acesso a relação em serialização
  ```python
  "0.9",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/events.py:2505** - Possível acesso a relação em serialização
  ```python
  _target_class_doc = "SomeClass.some_attribute"
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/mapper.py:146** - Loop com query de relação
  ```python
  for reg in _all_registries():
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/mapper.py:146** - Acesso a atributo de relação em loop
  ```python
  for reg in _all_registries():
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/mapper.py:193** - Possível acesso a relação em serialização
  ```python
  "1.3",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/mapper.py:1177** - Possível acesso a relação em serialização
  ```python
  @util.deprecated("1.3", "Use .persist_selectable")
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/mapper.py:2199** - Possível acesso a relação em serialização
  ```python
  "2.0",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/mapper.py:2224** - Possível acesso a relação em serialização
  ```python
  "2.0",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/mapped_collection.py:79** - Acesso a atributo de relação em loop
  ```python
  for col in self._cols(m)
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/scoping.py:288** - Query sem joins explícitos
  ```python
  result = MyClass.query.filter(MyClass.name=='foo').all()
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/clsregistry.py:103** - Acesso a atributo de relação em loop
  ```python
  for token in tokens:
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/session.py:541** - Loop com query de relação
  ```python
  for d in self.statement.column_descriptions:
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/session.py:541** - Acesso a atributo de relação em loop
  ```python
  for d in self.statement.column_descriptions:
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/session.py:207** - Possível acesso a relação em serialização
  ```python
  "1.3",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/__init__.py:166** - Possível acesso a relação em serialização
  ```python
  _sa_util.preloaded.import_prefix("sqlalchemy.orm")
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/__init__.py:167** - Possível acesso a relação em serialização
  ```python
  _sa_util.preloaded.import_prefix("sqlalchemy.ext")
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/writeonly.py:266** - Acesso a atributo de relação em loop
  ```python
  for fn in self.dispatch.append:
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/context.py:231** - Loop com query de relação
  ```python
  for opt in statement._with_options:
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/context.py:231** - Acesso a atributo de relação em loop
  ```python
  for opt in statement._with_options:
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/context.py:2222** - Possível acesso a relação em serialização
  ```python
  "1.4",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/collections.py:573** - Acesso a atributo de relação em loop
  ```python
  for item in items:
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/collections.py:316** - Possível acesso a relação em serialização
  ```python
  "1.3",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/_orm_constructors.py:408** - Acesso a atributo de relação em loop
  ```python
  for arg in ("init", "kw_only", "default", "default_factory")
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/_orm_constructors.py:82** - Possível acesso a relação em serialização
  ```python
  "1.4",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/_orm_constructors.py:401** - Possível acesso a relação em serialização
  ```python
  "2.0",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/dependency.py:163** - Acesso a atributo de relação em loop
  ```python
  for state in states:
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/descriptor_props.py:286** - Acesso a atributo de relação em loop
  ```python
  getattr(instance, key) for key in self._attribute_keys
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/descriptor_props.py:476** - Possível acesso a relação em serialização
  ```python
  @util.preload_module("orm.properties")
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/descriptor_props.py:503** - Possível acesso a relação em serialização
  ```python
  @util.preload_module("orm.properties")
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/descriptor_props.py:520** - Possível acesso a relação em serialização
  ```python
  @util.preload_module("orm.properties")
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/decl_api.py:120** - Loop com query de relação
  ```python
  for class_ in cls.__mro__[1:]:
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/decl_api.py:120** - Acesso a atributo de relação em loop
  ```python
  for class_ in cls.__mro__[1:]:
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/decl_api.py:355** - Possível acesso a relação em serialização
  ```python
  user_id: Mapped[int] = mapped_column(ForeignKey("user_table.id"))
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/bulk_persistence.py:122** - Loop com query de relação
  ```python
  states = [(state, state.dict) for state in mappings]
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/bulk_persistence.py:122** - Acesso a atributo de relação em loop
  ```python
  states = [(state, state.dict) for state in mappings]
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/identity.py:238** - Acesso a atributo de relação em loop
  ```python
  for state in values:
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/evaluator.py:148** - Acesso a atributo de relação em loop
  ```python
  evaluators = [self.process(clause) for clause in clause.clauses]
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/evaluator.py:364** - Possível acesso a relação em serialização
  ```python
  "2.0",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/unitofwork.py:351** - Loop com query de relação
  ```python
  for dep in mapper._dependency_processors:
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/unitofwork.py:351** - Acesso a atributo de relação em loop
  ```python
  for dep in mapper._dependency_processors:
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/base.py:301** - Loop com query de relação
  ```python
  for assertion in assertions:
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/base.py:301** - Acesso a atributo de relação em loop
  ```python
  for assertion in assertions:
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/base.py:519** - Possível acesso a relação em serialização
  ```python
  _state_mapper = util.dottedgetter("manager.mapper")
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/relationships.py:678** - Loop com query de relação
  ```python
  for clause in util.coerce_generator_arg(criteria)
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/relationships.py:678** - Acesso a atributo de relação em loop
  ```python
  for clause in util.coerce_generator_arg(criteria)
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/state.py:215** - Loop com query de relação
  ```python
  {key: AttributeState(self, key) for key in self.manager}
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/state.py:215** - Acesso a atributo de relação em loop
  ```python
  {key: AttributeState(self, key) for key in self.manager}
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/orm/state.py:839** - Possível acesso a relação em serialização
  ```python
  "2.0",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/engine/interfaces.py:2585** - Possível acesso a relação em serialização
  ```python
  __import__("mydialect.provision")
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/engine/interfaces.py:2727** - Possível acesso a relação em serialização
  ```python
  'sqlalchemy.plugins': [
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/engine/create.py:225** - Acesso a atributo de relação em loop
  ```python
  "empty set" behavior for IN in all cases.
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/engine/create.py:96** - Possível acesso a relação em serialização
  ```python
  "1.4",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/engine/create.py:104** - Possível acesso a relação em serialização
  ```python
  "1.4",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/engine/create.py:113** - Possível acesso a relação em serialização
  ```python
  "2.0",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/engine/create.py:356** - Possível acesso a relação em serialização
  ```python
  "sqlalchemy.engine" logger. Defaults to a hexstring of the
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/engine/create.py:422** - Possível acesso a relação em serialização
  ```python
  "sqlalchemy.pool" logger. Defaults to a hexstring of the object's
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/engine/create.py:592** - Possível acesso a relação em serialização
  ```python
  "2.0",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/engine/events.py:200** - Possível acesso a relação em serialização
  ```python
  "1.4",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/engine/events.py:256** - Possível acesso a relação em serialização
  ```python
  "1.4",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/engine/events.py:372** - Possível acesso a relação em serialização
  ```python
  "2.0", ["conn", "branch"], converter=lambda conn: (conn, False)
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/engine/reflection.py:21** - Loop com query de relação
  ```python
  with (e.g. list comprehension [d['name'] for d in cols]).
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/engine/reflection.py:21** - Acesso a atributo de relação em loop
  ```python
  with (e.g. list comprehension [d['name'] for d in cols]).
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/engine/reflection.py:204** - Possível acesso a relação em serialização
  ```python
  "1.4",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/engine/reflection.py:272** - Possível acesso a relação em serialização
  ```python
  "1.4",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/engine/url.py:265** - Loop com query de relação
  ```python
  return tuple(_assert_value(elem) for elem in val)
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/engine/url.py:265** - Acesso a atributo de relação em loop
  ```python
  return tuple(_assert_value(elem) for elem in val)
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/engine/url.py:598** - Possível acesso a relação em serialização
  ```python
  "1.4",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/engine/url.py:800** - Possível acesso a relação em serialização
  ```python
  "1.4",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/engine/result.py:224** - Acesso a atributo de relação em loop
  ```python
  self._keys = [k for k in parent._keys if k is not None]
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/engine/default.py:594** - Loop com query de relação
  ```python
  for idx in self.get_indexes(
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/engine/default.py:594** - Acesso a atributo de relação em loop
  ```python
  for idx in self.get_indexes(
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/engine/default.py:269** - Possível acesso a relação em serialização
  ```python
  "1.4",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/engine/default.py:278** - Possível acesso a relação em serialização
  ```python
  "1.4",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/engine/default.py:316** - Possível acesso a relação em serialização
  ```python
  "2.0",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/engine/default.py:370** - Possível acesso a relação em serialização
  ```python
  "2.0",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/engine/processors.py:59** - Possível acesso a relação em serialização
  ```python
  # Decimal('5.00000') whereas the C implementation will
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/engine/row.py:266** - Acesso a atributo de relação em loop
  ```python
  return tuple([k for k in self._parent.keys if k is not None])
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/engine/base.py:1566** - Loop com query de relação
  ```python
  for fn in self.dispatch.before_execute:
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/engine/base.py:1566** - Acesso a atributo de relação em loop
  ```python
  for fn in self.dispatch.before_execute:
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/engine/base.py:312** - Possível acesso a relação em serialização
  ```python
  ``logging.getLogger("sqlalchemy.engine")`` logger. This allows a
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/engine/cursor.py:174** - Loop com query de relação
  ```python
  extra=[self._keymap[key][MD_OBJECTS] for key in self._keys],
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/engine/cursor.py:174** - Acesso a atributo de relação em loop
  ```python
  extra=[self._keymap[key][MD_OBJECTS] for key in self._keys],
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/pool/events.py:59** - Possível acesso a relação em serialização
  ```python
  @util.preload_module("sqlalchemy.engine")
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/pool/events.py:194** - Possível acesso a relação em serialização
  ```python
  "2.0",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/pool/impl.py:366** - Acesso a atributo de relação em loop
  ```python
  for conn in self._all_conns:
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/pool/base.py:198** - Possível acesso a relação em serialização
  ```python
  "sqlalchemy.pool" logger. Defaults to a hexstring of the object's
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/pool/base.py:694** - Possível acesso a relação em serialização
  ```python
  "2.0",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/pool/base.py:1254** - Possível acesso a relação em serialização
  ```python
  "2.0",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/event/registry.py:111** - Acesso a atributo de relação em loop
  ```python
  for key in listener_to_key.values():
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/event/api.py:31** - Acesso a atributo de relação em loop
  ```python
  for evt_cls in _registrars[identifier]:
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/event/attr.py:192** - Acesso a atributo de relação em loop
  ```python
  for cls in util.walk_subclasses(target):
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/event/base.py:67** - Acesso a atributo de relação em loop
  ```python
  for cls in _instance_cls.__mro__:
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/sql/functions.py:164** - Acesso a atributo de relação em loop
  ```python
  for c in clauses
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/sql/annotation.py:108** - Loop com query de relação
  ```python
  for key in sorted(self._annotations)
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/sql/annotation.py:108** - Acesso a atributo de relação em loop
  ```python
  for key in sorted(self._annotations)
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/sql/ddl.py:386** - Acesso a atributo de relação em loop
  ```python
  available for use in string substitutions on the DDL statement.
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/sql/compiler.py:230** - Loop com query de relação
  ```python
  ILLEGAL_INITIAL_CHARACTERS = {str(x) for x in range(0, 10)}.union(["$"])
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/sql/compiler.py:230** - Acesso a atributo de relação em loop
  ```python
  ILLEGAL_INITIAL_CHARACTERS = {str(x) for x in range(0, 10)}.union(["$"])
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/sql/compiler.py:658** - Possível acesso a relação em serialização
  ```python
  'self.from_linter'"""
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/sql/compiler.py:1543** - Possível acesso a relação em serialização
  ```python
  is used; the format of "self.stack" may change.
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/sql/compiler.py:5009** - Possível acesso a relação em serialização
  ```python
  version="1.4",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/sql/compiler.py:7374** - Possível acesso a relação em serialização
  ```python
  version="0.9",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/sql/compiler.py:7412** - Possível acesso a relação em serialização
  ```python
  version="0.9",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/sql/traversals.py:55** - Acesso a atributo de relação em loop
  ```python
  for cls in util.walk_subclasses(target_hierarchy):
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/sql/cache_key.py:322** - Acesso a atributo de relação em loop
  ```python
  for elem in obj
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/sql/util.py:153** - Loop com query de relação
  ```python
  for s in selectables:
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/sql/util.py:153** - Acesso a atributo de relação em loop
  ```python
  for s in selectables:
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/sql/visitors.py:585** - Acesso a atributo de relação em loop
  ```python
  for sym in InternalTraversal:
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/sql/elements.py:1321** - Loop com query de relação
  ```python
  """Represent a column-oriented SQL expression suitable for usage in the
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/sql/elements.py:1321** - Acesso a atributo de relação em loop
  ```python
  """Represent a column-oriented SQL expression suitable for usage in the
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/sql/elements.py:1882** - Possível acesso a relação em serialização
  ```python
  "1.4",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/sql/elements.py:1891** - Possível acesso a relação em serialização
  ```python
  "1.4",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/sql/elements.py:3133** - Possível acesso a relação em serialização
  ```python
  version="1.4",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/sql/__init__.py:142** - Possível acesso a relação em serialização
  ```python
  _sa_util.preloaded.import_prefix("sqlalchemy.sql")
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/sql/_elements_constructors.py:427** - Acesso a atributo de relação em loop
  ```python
  """Create an 'OUT' parameter for usage in functions (stored procedures),
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/sql/sqltypes.py:192** - Loop com query de relação
  ```python
  :param length: optional, a length for the column for use in
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/sql/sqltypes.py:192** - Acesso a atributo de relação em loop
  ```python
  :param length: optional, a length for the column for use in
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/sql/selectable.py:414** - Loop com query de relação
  ```python
  for p in prefixes
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/sql/selectable.py:414** - Acesso a atributo de relação em loop
  ```python
  for p in prefixes
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/sql/selectable.py:314** - Possível acesso a relação em serialização
  ```python
  "1.4",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/sql/selectable.py:2824** - Possível acesso a relação em serialização
  ```python
  "1.4",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/sql/selectable.py:3432** - Possível acesso a relação em serialização
  ```python
  "1.4",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/sql/selectable.py:3472** - Possível acesso a relação em serialização
  ```python
  "1.4",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/sql/selectable.py:3491** - Possível acesso a relação em serialização
  ```python
  "1.4",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/sql/selectable.py:5712** - Possível acesso a relação em serialização
  ```python
  "1.4",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/sql/selectable.py:5934** - Possível acesso a relação em serialização
  ```python
  "entities", "Select.with_only_columns", entities
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/sql/dml.py:156** - Acesso a atributo de relação em loop
  ```python
  for c in statement._all_selected_columns
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/sql/coercions.py:104** - Acesso a atributo de relação em loop
  ```python
  for elem in element:
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/sql/coercions.py:1186** - Possível acesso a relação em serialização
  ```python
  "1.4",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/sql/coercions.py:1257** - Possível acesso a relação em serialização
  ```python
  version="1.4",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/sql/coercions.py:1289** - Possível acesso a relação em serialização
  ```python
  version="1.4",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/sql/coercions.py:1322** - Possível acesso a relação em serialização
  ```python
  version="1.4",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/sql/base.py:244** - Loop com query de relação
  ```python
  [element._from_objects for element in elements]
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/sql/base.py:244** - Acesso a atributo de relação em loop
  ```python
  [element._from_objects for element in elements]
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/sql/base.py:452** - Possível acesso a relação em serialização
  ```python
  @util.preload_module("sqlalchemy.dialects")
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/sql/type_api.py:582** - Loop com query de relação
  ```python
  (pre-result-processing), for use in the "sentinel" feature.
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/sql/type_api.py:582** - Acesso a atributo de relação em loop
  ```python
  (pre-result-processing), for use in the "sentinel" feature.
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/sql/type_api.py:1171** - Possível acesso a relação em serialização
  ```python
  (<class '__main__.MyType'>, ('choices', ('a', 'b', 'c')))
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/sql/type_api.py:1192** - Possível acesso a relação em serialização
  ```python
  this is the non-cacheable version, as "self.lookup" is not
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/sql/type_api.py:1204** - Possível acesso a relação em serialização
  ```python
  # ...  works with "self.lookup" ...
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/sql/type_api.py:1228** - Possível acesso a relação em serialização
  ```python
  (<class '__main__.LookupType'>, ('lookup', {'a': 10, 'b': 20}))
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/sql/type_api.py:1265** - Possível acesso a relação em serialização
  ```python
  # ...  works with "self._lookup" ...
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/sql/type_api.py:1270** - Possível acesso a relação em serialização
  ```python
  (<class '__main__.LookupType'>, ('lookup', (('a', 10), ('b', 20))))
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/sql/type_api.py:1654** - Possível acesso a relação em serialização
  ```python
  # Dialect.type_compiler) where the "cls.attr" is a class to make something,
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/sql/type_api.py:1655** - Possível acesso a relação em serialização
  ```python
  # and "instance.attr" is an instance of that thing.  It's such a nifty,
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/sql/crud.py:121** - Acesso a atributo de relação em loop
  ```python
  """create a set of tuples representing column/string pairs for use
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/sql/crud.py:143** - Possível acesso a relação em serialização
  ```python
  # overall, the "compiler.XYZ" collections here would need to be in a
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/sql/lambdas.py:112** - Acesso a atributo de relação em loop
  ```python
  :param enable_tracking: when False, all scanning of the given lambda for
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/sql/schema.py:221** - Loop com query de relação
  ```python
  for item in args:
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/sql/schema.py:221** - Acesso a atributo de relação em loop
  ```python
  for item in args:
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/sql/schema.py:431** - Possível acesso a relação em serialização
  ```python
  "1.4",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/sql/schema.py:1308** - Possível acesso a relação em serialização
  ```python
  "1.4",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/sql/schema.py:1673** - Possível acesso a relação em serialização
  ```python
  Column('id', ForeignKey('other.id'),
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/sql/schema.py:2438** - Possível acesso a relação em serialização
  ```python
  "1.4",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/sql/schema.py:2731** - Possível acesso a relação em serialização
  ```python
  Column("remote_id", ForeignKey("main_table.id"))
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/sql/schema.py:2900** - Possível acesso a relação em serialização
  ```python
  "1.4",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/sql/schema.py:2951** - Possível acesso a relação em serialização
  ```python
  This is usually the equivalent of the string-based "tablename.colname"
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/sql/schema.py:3041** - Possível acesso a relação em serialização
  ```python
  # specified as 'foo', 'foo.bar', 'dbo.foo.bar',
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/sql/schema.py:3353** - Possível acesso a relação em serialização
  ```python
  "2.0",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/sql/schema.py:4157** - Possível acesso a relação em serialização
  ```python
  "1.4",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/sql/schema.py:4376** - Possível acesso a relação em serialização
  ```python
  "1.4",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/sql/schema.py:4516** - Possível acesso a relação em serialização
  ```python
  "1.4",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/sql/schema.py:4800** - Possível acesso a relação em serialização
  ```python
  "1.4",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/sql/schema.py:5945** - Possível acesso a relação em serialização
  ```python
  "1.4",
  ```

- **apps/api/venv/lib/python3.9/site-packages/sqlalchemy/sql/schema.py:6096** - Possível acesso a relação em serialização
  ```python
  "1.4",
  ```

- **apps/api/venv/lib/python3.9/site-packages/exceptiongroup/_formatting.py:64** - Loop com query de relação
  ```python
  for text in text_gen:
  ```

- **apps/api/venv/lib/python3.9/site-packages/exceptiongroup/_formatting.py:64** - Acesso a atributo de relação em loop
  ```python
  for text in text_gen:
  ```

- **apps/api/venv/lib/python3.9/site-packages/exceptiongroup/_formatting.py:111** - Possível acesso a relação em serialização
  ```python
  HTTPError = getattr(sys.modules.get("urllib.error", None), "HTTPError", ())
  ```

- **apps/api/venv/lib/python3.9/site-packages/exceptiongroup/_exceptions.py:28** - Acesso a atributo de relação em loop
  ```python
  for cls in getmro(exc.__class__)[:-1]:
  ```

- **apps/api/venv/lib/python3.9/site-packages/charset_normalizer/md.py:312** - Acesso a atributo de relação em loop
  ```python
  and all(_.isupper() for _ in self._buffer) is False
  ```

- **apps/api/venv/lib/python3.9/site-packages/charset_normalizer/models.py:126** - Acesso a atributo de relação em loop
  ```python
  return [e[0] for e in self._languages]
  ```

- **apps/api/venv/lib/python3.9/site-packages/charset_normalizer/cli/__main__.py:86** - Acesso a atributo de relação em loop
  ```python
  elif any(c in self._mode for c in "wax"):
  ```

- **apps/api/venv/lib/python3.9/site-packages/requests/cookies.py:157** - Acesso a atributo de relação em loop
  ```python
  for cookie in cookiejar:
  ```

- **apps/api/venv/lib/python3.9/site-packages/requests/sessions.py:85** - Loop com query de relação
  ```python
  for key in none_keys:
  ```

- **apps/api/venv/lib/python3.9/site-packages/requests/sessions.py:85** - Acesso a atributo de relação em loop
  ```python
  for key in none_keys:
  ```

- **apps/api/venv/lib/python3.9/site-packages/requests/models.py:124** - Loop com query de relação
  ```python
  for v in vs:
  ```

- **apps/api/venv/lib/python3.9/site-packages/requests/models.py:124** - Acesso a atributo de relação em loop
  ```python
  for v in vs:
  ```

- **apps/api/venv/lib/python3.9/site-packages/requests/packages.py:15** - Acesso a atributo de relação em loop
  ```python
  for package in ("urllib3", "idna"):
  ```

- **apps/api/venv/lib/python3.9/site-packages/requests/utils.py:101** - Loop com query de relação
  ```python
  for test in proxyOverride:
  ```

- **apps/api/venv/lib/python3.9/site-packages/requests/utils.py:101** - Acesso a atributo de relação em loop
  ```python
  for test in proxyOverride:
  ```

- **apps/api/venv/lib/python3.9/site-packages/requests/adapters.py:158** - Acesso a atributo de relação em loop
  ```python
  return {attr: getattr(self, attr, None) for attr in self.__attrs__}
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/__pip-runner__.py:16** - Acesso a atributo de relação em loop
  ```python
  return ".".join(str(v) for v in version)
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/configuration.py:70** - Loop com query de relação
  ```python
  os.path.join(path, CONFIG_BASENAME) for path in appdirs.site_config_dirs("pip")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/configuration.py:70** - Acesso a atributo de relação em loop
  ```python
  os.path.join(path, CONFIG_BASENAME) for path in appdirs.site_config_dirs("pip")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/configuration.py:32** - Possível acesso a relação em serialização
  ```python
  CONFIG_BASENAME = "pip.ini" if WINDOWS else "pip.conf"
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/configuration.py:32** - Possível acesso a relação em serialização
  ```python
  CONFIG_BASENAME = "pip.ini" if WINDOWS else "pip.conf"
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/pyproject.py:23** - Acesso a atributo de relação em loop
  ```python
  return isinstance(obj, list) and all(isinstance(item, str) for item in obj)
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/pyproject.py:27** - Possível acesso a relação em serialização
  ```python
  return os.path.join(unpacked_source_directory, "pyproject.toml")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/pyproject.py:65** - Possível acesso a relação em serialização
  ```python
  f"neither 'setup.py' nor 'pyproject.toml' found."
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/pyproject.py:65** - Possível acesso a relação em serialização
  ```python
  f"neither 'setup.py' nor 'pyproject.toml' found."
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/cache.py:82** - Loop com query de relação
  ```python
  return [(candidate, path) for candidate in os.listdir(path)]
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/cache.py:82** - Acesso a atributo de relação em loop
  ```python
  return [(candidate, path) for candidate in os.listdir(path)]
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/cache.py:22** - Possível acesso a relação em serialização
  ```python
  ORIGIN_JSON_NAME = "origin.json"
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/exceptions.py:261** - Acesso a atributo de relação em loop
  ```python
  before = ", ".join(str(a) for a in self.args[:-1])
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/wheel_builder.py:289** - Acesso a atributo de relação em loop
  ```python
  ", ".join(req.name for req in requirements),  # type: ignore
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/wheel_builder.py:139** - Possível acesso a relação em serialização
  ```python
  if metadata_version >= Version("1.2") and not isinstance(dist.version, Version):
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/build_env.py:76** - Loop com query de relação
  ```python
  return {os.path.normcase(path) for path in system_sites}
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/build_env.py:76** - Acesso a atributo de relação em loop
  ```python
  return {os.path.normcase(path) for path in system_sites}
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/build_env.py:105** - Possível acesso a relação em serialização
  ```python
  os.path.join(self._site_dir, "sitecustomize.py"), "w", encoding="utf-8"
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/network/auth.py:204** - Acesso a atributo de relação em loop
  ```python
  for path in PATH_as_shutil_which_determines_it().split(os.pathsep):
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/network/download.py:218** - Acesso a atributo de relação em loop
  ```python
  for chunk in chunks:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/network/session.py:107** - Loop com query de relação
  ```python
  return any(name in os.environ for name in CI_ENVIRONMENT_VARIABLES)
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/network/session.py:107** - Acesso a atributo de relação em loop
  ```python
  return any(name in os.environ for name in CI_ENVIRONMENT_VARIABLES)
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/network/utils.py:65** - Acesso a atributo de relação em loop
  ```python
  for chunk in response.raw.stream(
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/network/lazy_wheel.py:156** - Loop com query de relação
  ```python
  for start in reversed(range(0, end, self._chunk_size)):
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/network/lazy_wheel.py:156** - Acesso a atributo de relação em loop
  ```python
  for start in reversed(range(0, end, self._chunk_size)):
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/utils/logging.py:122** - Acesso a atributo de relação em loop
  ```python
  formatted = "".join([prefix + line for line in formatted.splitlines(True)])
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/utils/logging.py:34** - Possível acesso a relação em serialização
  ```python
  subprocess_logger = getLogger("pip.subprocessor")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/utils/logging.py:301** - Possível acesso a relação em serialização
  ```python
  "()": "logging.Filter",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/utils/logging.py:357** - Possível acesso a relação em serialização
  ```python
  "loggers": {"pip._vendor": {"level": vendored_log_level}},
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/utils/misc.py:211** - Loop com query de relação
  ```python
  for action in os.environ.get("PIP_EXISTS_ACTION", "").split():
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/utils/misc.py:211** - Acesso a atributo de relação em loop
  ```python
  for action in os.environ.get("PIP_EXISTS_ACTION", "").split():
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/utils/misc.py:115** - Possível acesso a relação em serialização
  ```python
  if prog in ("__main__.py", "-c"):
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/utils/misc.py:303** - Possível acesso a relação em serialização
  ```python
  if os.path.isfile(os.path.join(path, "pyproject.toml")):
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/utils/misc.py:305** - Possível acesso a relação em serialização
  ```python
  if os.path.isfile(os.path.join(path, "setup.py")):
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/utils/egg_link.py:38** - Acesso a atributo de relação em loop
  ```python
  for path_item in sys.path:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/utils/subprocess.py:22** - Acesso a atributo de relação em loop
  ```python
  for arg in args:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/utils/filesystem.py:95** - Acesso a atributo de relação em loop
  ```python
  for _ in range(10):
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/utils/temp_dir.py:261** - Acesso a atributo de relação em loop
  ```python
  for i in range(1, len(name)):
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/utils/entrypoints.py:19** - Loop com query de relação
  ```python
  for parts in itertools.product(_EXECUTABLE_NAMES, _allowed_extensions)
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/utils/entrypoints.py:19** - Acesso a atributo de relação em loop
  ```python
  for parts in itertools.product(_EXECUTABLE_NAMES, _allowed_extensions)
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/utils/compatibility_tags.py:39** - Acesso a atributo de relação em loop
  ```python
  for arch in mac_platforms(mac_version, actual_arch)
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/utils/hashes.py:36** - Loop com query de relação
  ```python
  allowed[alg] = [k.lower() for k in sorted(keys)]
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/utils/hashes.py:36** - Acesso a atributo de relação em loop
  ```python
  allowed[alg] = [k.lower() for k in sorted(keys)]
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/utils/virtualenv.py:73** - Acesso a atributo de relação em loop
  ```python
  for line in cfg_lines:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/utils/virtualenv.py:41** - Possível acesso a relação em serialização
  ```python
  pyvenv_cfg_file = os.path.join(sys.prefix, "pyvenv.cfg")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/utils/virtualenv.py:67** - Possível acesso a relação em serialização
  ```python
  "Could not access 'pyvenv.cfg' despite a virtual environment "
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/utils/glibc.py:64** - Possível acesso a relação em serialização
  ```python
  # Call gnu_get_libc_version, which returns a string like "2.5"
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/utils/glibc.py:78** - Possível acesso a relação em serialização
  ```python
  #   ('glibc', '2.7')
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/utils/glibc.py:80** - Possível acesso a relação em serialização
  ```python
  #   ('glibc', '2.9')
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/utils/unpacking.py:66** - Acesso a atributo de relação em loop
  ```python
  for path in paths:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/models/link.py:64** - Acesso a atributo de relação em loop
  ```python
  choices="|".join(re.escape(hash_name) for hash_name in _SUPPORTED_HASHES)
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/models/link.py:475** - Possível acesso a relação em serialização
  ```python
  gone_in="25.2",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/models/direct_url.py:51** - Acesso a atributo de relação em loop
  ```python
  infos = [info for info in infos if info is not None]
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/models/direct_url.py:19** - Possível acesso a relação em serialização
  ```python
  DIRECT_URL_METADATA_NAME = "direct_url.json"
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/models/pylock.py:19** - Possível acesso a relação em serialização
  ```python
  return path.name == "pylock.toml" or bool(re.match(PYLOCK_FILE_NAME_RE, path.name))
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/models/pylock.py:159** - Possível acesso a relação em serialização
  ```python
  lock_version: str = "1.0"
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/models/search_scope.py:46** - Acesso a atributo de relação em loop
  ```python
  for link in find_links:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/models/format_control.py:33** - Acesso a atributo de relação em loop
  ```python
  return all(getattr(self, k) == getattr(other, k) for k in self.__slots__)
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/models/wheel.py:70** - Acesso a atributo de relação em loop
  ```python
  for py in pyversions
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/models/wheel.py:57** - Possível acesso a relação em serialização
  ```python
  gone_in="25.3",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/cli/cmdoptions.py:58** - Acesso a atributo de relação em loop
  ```python
  for option in group["options"]:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/cli/cmdoptions.py:615** - Possível acesso a relação em serialização
  ```python
  integers (e.g. "3" for 3.0.0, "3.7" for 3.7.0, or "3.7.3"). A major-minor
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/cli/cmdoptions.py:762** - Possível acesso a relação em serialização
  ```python
  path = "pyproject.toml"
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/cli/cmdoptions.py:764** - Possível acesso a relação em serialização
  ```python
  # check for 'pyproject.toml' filenames using pathlib
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/cli/cmdoptions.py:765** - Possível acesso a relação em serialização
  ```python
  if pathlib.PurePath(path).name != "pyproject.toml":
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/cli/cmdoptions.py:766** - Possível acesso a relação em serialização
  ```python
  msg = "group paths use 'pyproject.toml' filenames"
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/cli/cmdoptions.py:781** - Possível acesso a relação em serialização
  ```python
  help='Install a named dependency-group from a "pyproject.toml" file. '
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/cli/cmdoptions.py:782** - Possível acesso a relação em serialização
  ```python
  'If a path is given, the name of the file must be "pyproject.toml". '
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/cli/cmdoptions.py:783** - Possível acesso a relação em serialização
  ```python
  'Defaults to using "pyproject.toml" in the current directory.',
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/cli/parser.py:96** - Loop com query de relação
  ```python
  new_lines = [indent + line for line in text.split("\n")]
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/cli/parser.py:96** - Acesso a atributo de relação em loop
  ```python
  new_lines = [indent + line for line in text.split("\n")]
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/cli/autocompletion.py:36** - Acesso a atributo de relação em loop
  ```python
  for word in cwords:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/cli/main_parser.py:57** - Acesso a atributo de relação em loop
  ```python
  for exe in ("bin/python", "Scripts/python.exe"):
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/cli/progress_bars.py:61** - Acesso a atributo de relação em loop
  ```python
  for chunk in iterable:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/cli/req_command.py:57** - Loop com query de relação
  ```python
  for t in KEEPABLE_TEMPDIR_TYPES:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/cli/req_command.py:57** - Acesso a atributo de relação em loop
  ```python
  for t in KEEPABLE_TEMPDIR_TYPES:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/operations/check.py:54** - Acesso a atributo de relação em loop
  ```python
  for dist in env.iter_installed_distributions(local_only=False, skip=()):
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/operations/freeze.py:43** - Acesso a atributo de relação em loop
  ```python
  for dist in dists:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/operations/prepare.py:466** - Acesso a atributo de relação em loop
  ```python
  for req in partially_downloaded_reqs:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/operations/install/wheel.py:118** - Loop com query de relação
  ```python
  for entry_point in dist.iter_entry_points():
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/operations/install/wheel.py:118** - Acesso a atributo de relação em loop
  ```python
  for entry_point in dist.iter_entry_points():
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/operations/build/wheel_legacy.py:83** - Possível acesso a relação em serialização
  ```python
  gone_in="25.3",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/operations/build/metadata_legacy.py:22** - Acesso a atributo de relação em loop
  ```python
  filenames = [f for f in os.listdir(directory) if f.endswith(".egg-info")]
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/req/req_install.py:235** - Acesso a atributo de relação em loop
  ```python
  state = (f"{attr}={attributes[attr]!r}" for attr in sorted(names))
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/req/req_install.py:488** - Possível acesso a relação em serialização
  ```python
  setup_py = os.path.join(self.unpacked_source_directory, "setup.py")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/req/req_install.py:495** - Possível acesso a relação em serialização
  ```python
  setup_cfg = os.path.join(self.unpacked_source_directory, "setup.cfg")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/req/req_install.py:546** - Possível acesso a relação em serialização
  ```python
  f"Project {self} has a 'pyproject.toml' and its build "
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/req/req_install.py:548** - Possível acesso a relação em serialização
  ```python
  f"have a 'setup.py' nor a 'setup.cfg', "
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/req/req_install.py:548** - Possível acesso a relação em serialização
  ```python
  f"have a 'setup.py' nor a 'setup.cfg', "
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/req/req_install.py:840** - Possível acesso a relação em serialização
  ```python
  gone_in="25.3",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/req/req_install.py:928** - Possível acesso a relação em serialização
  ```python
  gone_in="25.3",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/req/req_set.py:23** - Acesso a atributo de relação em loop
  ```python
  (req for req in self.requirements.values() if not req.comes_from),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/req/req_uninstall.py:46** - Acesso a atributo de relação em loop
  ```python
  for item in fn(*args, **kw):
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/req/req_uninstall.py:161** - Possível acesso a relação em serialização
  ```python
  if path.endswith("__init__.py") or ".dist-info" in path:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/req/req_uninstall.py:483** - Possível acesso a relação em serialização
  ```python
  elif dist.is_file("top_level.txt"):
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/req/req_uninstall.py:485** - Possível acesso a relação em serialização
  ```python
  namespace_packages = dist.read_text("namespace_packages.txt")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/req/req_uninstall.py:492** - Possível acesso a relação em serialização
  ```python
  for p in dist.read_text("top_level.txt").splitlines()
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/req/req_file.py:82** - Acesso a atributo de relação em loop
  ```python
  SUPPORTED_OPTIONS_REQ_DEST = [str(o().dest) for o in SUPPORTED_OPTIONS_REQ]
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/req/constructors.py:118** - Loop com query de relação
  ```python
  for version_control in vcs:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/req/constructors.py:118** - Acesso a atributo de relação em loop
  ```python
  for version_control in vcs:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/req/constructors.py:288** - Possível acesso a relação em serialização
  ```python
  f"Directory {name!r} is not installable. Neither 'setup.py' "
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/req/constructors.py:289** - Possível acesso a relação em serialização
  ```python
  "nor 'pyproject.toml' found."
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/req/constructors.py:400** - Possível acesso a relação em serialização
  ```python
  requirement, directory containing 'setup.py', filename, or URL.
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/resolution/legacy/resolver.py:168** - Acesso a atributo de relação em loop
  ```python
  for req in root_reqs:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/resolution/resolvelib/provider.py:131** - Loop com query de relação
  ```python
  for info in backtrack_causes:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/resolution/resolvelib/provider.py:131** - Acesso a atributo de relação em loop
  ```python
  for info in backtrack_causes:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/resolution/resolvelib/factory.py:131** - Loop com query de relação
  ```python
  for dist in env.iter_installed_distributions(local_only=False)
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/resolution/resolvelib/factory.py:131** - Acesso a atributo de relação em loop
  ```python
  for dist in env.iter_installed_distributions(local_only=False)
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/resolution/resolvelib/factory.py:713** - Possível acesso a relação em serialização
  ```python
  if str(req) == "requirements.txt":
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/resolution/resolvelib/factory.py:716** - Possível acesso a relação em serialização
  ```python
  'named "requirements.txt" (which cannot exist). Consider '
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/resolution/resolvelib/factory.py:718** - Possível acesso a relação em serialização
  ```python
  "requirements.txt"
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/resolution/resolvelib/requirements.py:56** - Acesso a atributo de relação em loop
  ```python
  self._extras = frozenset(canonicalize_name(e) for e in self._ireq.extras)
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/resolution/resolvelib/resolver.py:114** - Acesso a atributo de relação em loop
  ```python
  for candidate in sorted(
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/resolution/resolvelib/candidates.py:256** - Acesso a atributo de relação em loop
  ```python
  for r in requires:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/resolution/resolvelib/base.py:52** - Acesso a atributo de relação em loop
  ```python
  if self.links and not all(_match_link(link, candidate) for link in self.links):
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/vcs/git.py:163** - Acesso a atributo de relação em loop
  ```python
  for line in output.strip().split("\n"):
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/vcs/git.py:45** - Possível acesso a relação em serialização
  ```python
  # Server, e.g. 'github.com'.
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/vcs/mercurial.py:82** - Possível acesso a relação em serialização
  ```python
  ["showconfig", "paths.default"],
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/vcs/versioncontrol.py:191** - Loop com query de relação
  ```python
  return [backend.dirname for backend in self.backends]
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/vcs/versioncontrol.py:191** - Acesso a atributo de relação em loop
  ```python
  return [backend.dirname for backend in self.backends]
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/vcs/subversion.py:148** - Acesso a atributo de relação em loop
  ```python
  revs = [int(d[9]) for d in entries if len(d) > 9 and d[9]] + [0]
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/locations/__init__.py:111** - Acesso a atributo de relação em loop
  ```python
  for k in ("unix_prefix", "unix_home")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/locations/_sysconfig.py:164** - Acesso a atributo de relação em loop
  ```python
  variables = {k: home for k in _HOME_KEYS}
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/locations/_distutils.py:62** - Acesso a atributo de relação em loop
  ```python
  ", ".join(os.path.basename(p) for p in paths),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/locations/base.py:22** - Possível acesso a relação em serialização
  ```python
  "3.7" or "3.10".
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/locations/base.py:22** - Possível acesso a relação em serialização
  ```python
  "3.7" or "3.10".
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/index/collector.py:56** - Loop com query de relação
  ```python
  for scheme in vcs.schemes:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/index/collector.py:56** - Acesso a atributo de relação em loop
  ```python
  for scheme in vcs.schemes:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/index/collector.py:348** - Possível acesso a relação em serialização
  ```python
  url = urllib.parse.urljoin(url, "index.html")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/index/sources.py:60** - Acesso a atributo de relação em loop
  ```python
  for entry in os.scandir(self._path):
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/index/package_finder.py:296** - Acesso a atributo de relação em loop
  ```python
  for candidate in candidates:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/commands/configuration.py:158** - Acesso a atributo de relação em loop
  ```python
  for site_config_file in get_configuration_files()[kinds.SITE]
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/commands/show.py:91** - Acesso a atributo de relação em loop
  ```python
  installed = {dist.canonical_name: dist for dist in env.iter_all_distributions()}
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/commands/show.py:128** - Possível acesso a relação em serialização
  ```python
  entry_points_text = dist.read_text("entry_points.txt")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/commands/list.py:178** - Acesso a atributo de relação em loop
  ```python
  skip.update(canonicalize_name(n) for n in options.excludes)
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/commands/completion.py:125** - Acesso a atributo de relação em loop
  ```python
  shell_options = ["--" + shell for shell in sorted(shells)]
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/commands/download.py:135** - Acesso a atributo de relação em loop
  ```python
  for req in requirement_set.requirements.values():
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/commands/cache.py:153** - Acesso a atributo de relação em loop
  ```python
  for filename in files:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/commands/debug.py:42** - Loop com query de relação
  ```python
  line.strip().split(" ", 1)[0] for line in f.readlines() if "==" in line
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/commands/debug.py:42** - Acesso a atributo de relação em loop
  ```python
  line.strip().split(" ", 1)[0] for line in f.readlines() if "==" in line
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/commands/debug.py:38** - Possível acesso a relação em serialização
  ```python
  with open_text_resource("pip._vendor", "vendor.txt") as f:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/commands/debug.py:38** - Possível acesso a relação em serialização
  ```python
  with open_text_resource("pip._vendor", "vendor.txt") as f:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/commands/debug.py:180** - Possível acesso a relação em serialização
  ```python
  show_value("sys.version", sys.version)
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/commands/debug.py:181** - Possível acesso a relação em serialização
  ```python
  show_value("sys.executable", sys.executable)
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/commands/debug.py:182** - Possível acesso a relação em serialização
  ```python
  show_value("sys.getdefaultencoding", sys.getdefaultencoding())
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/commands/debug.py:183** - Possível acesso a relação em serialização
  ```python
  show_value("sys.getfilesystemencoding", sys.getfilesystemencoding())
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/commands/debug.py:185** - Possível acesso a relação em serialização
  ```python
  "locale.getpreferredencoding",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/commands/debug.py:188** - Possível acesso a relação em serialização
  ```python
  show_value("sys.platform", sys.platform)
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/commands/lock.py:125** - Acesso a atributo de relação em loop
  ```python
  for req in reqs:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/commands/lock.py:57** - Possível acesso a relação em serialização
  ```python
  default="pylock.toml",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/commands/freeze.py:98** - Acesso a atributo de relação em loop
  ```python
  for line in freeze(
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/commands/install.py:359** - Acesso a atributo de relação em loop
  ```python
  for req in reqs:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/commands/wheel.py:150** - Acesso a atributo de relação em loop
  ```python
  for req in requirement_set.requirements.values():
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/metadata/__init__.py:78** - Possível acesso a relação em serialização
  ```python
  gone_in="26.3",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/metadata/pkg_resources.py:94** - Acesso a atributo de relação em loop
  ```python
  canonicalize_name(extra): extra for extra in self._dist.extras
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/metadata/base.py:324** - Loop com query de relação
  ```python
  for line in installer_text.splitlines():
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/metadata/base.py:324** - Acesso a atributo de relação em loop
  ```python
  for line in installer_text.splitlines():
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/metadata/base.py:523** - Possível acesso a relação em serialização
  ```python
  content = self.read_text("requires.txt")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/metadata/importlib/_dists.py:71** - Acesso a atributo de relação em loop
  ```python
  for name in zf.namelist()
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_internal/metadata/importlib/_envs.py:64** - Acesso a atributo de relação em loop
  ```python
  for dist in importlib.metadata.distributions(path=[location]):
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/__init__.py:67** - Possível acesso a relação em serialização
  ```python
  vendored("packaging.version")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/__init__.py:68** - Possível acesso a relação em serialização
  ```python
  vendored("packaging.specifiers")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/__init__.py:74** - Possível acesso a relação em serialização
  ```python
  vendored("requests.exceptions")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/__init__.py:75** - Possível acesso a relação em serialização
  ```python
  vendored("requests.packages")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/__init__.py:105** - Possível acesso a relação em serialização
  ```python
  vendored("rich.console")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/__init__.py:106** - Possível acesso a relação em serialização
  ```python
  vendored("rich.highlighter")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/__init__.py:107** - Possível acesso a relação em serialização
  ```python
  vendored("rich.logging")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/__init__.py:108** - Possível acesso a relação em serialização
  ```python
  vendored("rich.markup")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/__init__.py:109** - Possível acesso a relação em serialização
  ```python
  vendored("rich.progress")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/__init__.py:110** - Possível acesso a relação em serialização
  ```python
  vendored("rich.segment")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/__init__.py:111** - Possível acesso a relação em serialização
  ```python
  vendored("rich.style")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/__init__.py:112** - Possível acesso a relação em serialização
  ```python
  vendored("rich.text")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/__init__.py:113** - Possível acesso a relação em serialização
  ```python
  vendored("rich.traceback")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/typing_extensions.py:277** - Loop com query de relação
  ```python
  for p in parameters:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/typing_extensions.py:277** - Acesso a atributo de relação em loop
  ```python
  for p in parameters:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/typing_extensions.py:200** - Possível acesso a relação em serialização
  ```python
  return "typing_extensions.Any"
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/typing_extensions.py:514** - Possível acesso a relação em serialização
  ```python
  'collections.abc': [
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/typing_extensions.py:906** - Possível acesso a relação em serialização
  ```python
  return "typing_extensions.NoDefault"
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/typing_extensions.py:926** - Possível acesso a relação em serialização
  ```python
  return "typing_extensions.NoExtraItems"
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/typing_extensions.py:2950** - Possível acesso a relação em serialização
  ```python
  will produce output similar to 'Revealed type is "builtins.int"'.
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/typing_extensions.py:3690** - Possível acesso a relação em serialização
  ```python
  deprecation_msg.format(name=deprecated_thing, remove="3.15"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/typing_extensions.py:3963** - Possível acesso a relação em serialização
  ```python
  f"attribute '{name}' of 'typing.TypeAliasType' objects "
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/typing_extensions.py:3968** - Possível acesso a relação em serialização
  ```python
  f"'typing.TypeAliasType' object has no attribute '{name}'"
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/typing_extensions.py:4023** - Possível acesso a relação em serialização
  ```python
  "type 'typing_extensions.TypeAliasType' is not an acceptable base type"
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/tags.py:105** - Acesso a atributo de relação em loop
  ```python
  for interpreter in interpreters.split("."):
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/tags.py:161** - Possível acesso a relação em serialização
  ```python
  has_ext = "_d.pyd" in EXTENSION_SUFFIXES
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/_musllinux.py:24** - Acesso a atributo de relação em loop
  ```python
  lines = [n for n in (n.strip() for n in output.splitlines()) if n]
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/metadata.py:177** - Loop com query de relação
  ```python
  return [k.strip() for k in data.split(",")]
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/metadata.py:177** - Acesso a atributo de relação em loop
  ```python
  return [k.strip() for k in data.split(",")]
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/metadata.py:466** - Possível acesso a relação em serialização
  ```python
  _VALID_METADATA_VERSIONS = ["1.0", "1.1", "1.2", "2.1", "2.2", "2.3", "2.4"]
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/metadata.py:466** - Possível acesso a relação em serialização
  ```python
  _VALID_METADATA_VERSIONS = ["1.0", "1.1", "1.2", "2.1", "2.2", "2.3", "2.4"]
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/metadata.py:466** - Possível acesso a relação em serialização
  ```python
  _VALID_METADATA_VERSIONS = ["1.0", "1.1", "1.2", "2.1", "2.2", "2.3", "2.4"]
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/metadata.py:466** - Possível acesso a relação em serialização
  ```python
  _VALID_METADATA_VERSIONS = ["1.0", "1.1", "1.2", "2.1", "2.2", "2.3", "2.4"]
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/metadata.py:466** - Possível acesso a relação em serialização
  ```python
  _VALID_METADATA_VERSIONS = ["1.0", "1.1", "1.2", "2.1", "2.2", "2.3", "2.4"]
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/metadata.py:466** - Possível acesso a relação em serialização
  ```python
  _VALID_METADATA_VERSIONS = ["1.0", "1.1", "1.2", "2.1", "2.2", "2.3", "2.4"]
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/metadata.py:466** - Possível acesso a relação em serialização
  ```python
  _VALID_METADATA_VERSIONS = ["1.0", "1.1", "1.2", "2.1", "2.2", "2.3", "2.4"]
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/metadata.py:467** - Possível acesso a relação em serialização
  ```python
  _MetadataVersion = Literal["1.0", "1.1", "1.2", "2.1", "2.2", "2.3", "2.4"]
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/metadata.py:467** - Possível acesso a relação em serialização
  ```python
  _MetadataVersion = Literal["1.0", "1.1", "1.2", "2.1", "2.2", "2.3", "2.4"]
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/metadata.py:467** - Possível acesso a relação em serialização
  ```python
  _MetadataVersion = Literal["1.0", "1.1", "1.2", "2.1", "2.2", "2.3", "2.4"]
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/metadata.py:467** - Possível acesso a relação em serialização
  ```python
  _MetadataVersion = Literal["1.0", "1.1", "1.2", "2.1", "2.2", "2.3", "2.4"]
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/metadata.py:467** - Possível acesso a relação em serialização
  ```python
  _MetadataVersion = Literal["1.0", "1.1", "1.2", "2.1", "2.2", "2.3", "2.4"]
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/metadata.py:467** - Possível acesso a relação em serialização
  ```python
  _MetadataVersion = Literal["1.0", "1.1", "1.2", "2.1", "2.2", "2.3", "2.4"]
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/metadata.py:467** - Possível acesso a relação em serialização
  ```python
  _MetadataVersion = Literal["1.0", "1.1", "1.2", "2.1", "2.2", "2.3", "2.4"]
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/metadata.py:489** - Possível acesso a relação em serialização
  ```python
  added: _MetadataVersion = "1.0",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/metadata.py:795** - Possível acesso a relação em serialização
  ```python
  added="2.2",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/metadata.py:801** - Possível acesso a relação em serialização
  ```python
  supported_platforms: _Validator[list[str] | None] = _Validator(added="1.1")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/metadata.py:807** - Possível acesso a relação em serialização
  ```python
  description_content_type: _Validator[str | None] = _Validator(added="2.1")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/metadata.py:813** - Possível acesso a relação em serialização
  ```python
  download_url: _Validator[str | None] = _Validator(added="1.1")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/metadata.py:819** - Possível acesso a relação em serialização
  ```python
  maintainer: _Validator[str | None] = _Validator(added="1.2")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/metadata.py:821** - Possível acesso a relação em serialização
  ```python
  maintainer_email: _Validator[str | None] = _Validator(added="1.2")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/metadata.py:826** - Possível acesso a relação em serialização
  ```python
  added="2.4"
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/metadata.py:829** - Possível acesso a relação em serialização
  ```python
  license_files: _Validator[list[str] | None] = _Validator(added="2.4")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/metadata.py:831** - Possível acesso a relação em serialização
  ```python
  classifiers: _Validator[list[str] | None] = _Validator(added="1.1")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/metadata.py:834** - Possível acesso a relação em serialização
  ```python
  added="1.2"
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/metadata.py:838** - Possível acesso a relação em serialização
  ```python
  added="1.2"
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/metadata.py:843** - Possível acesso a relação em serialização
  ```python
  requires_external: _Validator[list[str] | None] = _Validator(added="1.2")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/metadata.py:845** - Possível acesso a relação em serialização
  ```python
  project_urls: _Validator[dict[str, str] | None] = _Validator(added="1.2")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/metadata.py:850** - Possível acesso a relação em serialização
  ```python
  added="2.1",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/metadata.py:853** - Possível acesso a relação em serialização
  ```python
  provides_dist: _Validator[list[str] | None] = _Validator(added="1.2")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/metadata.py:855** - Possível acesso a relação em serialização
  ```python
  obsoletes_dist: _Validator[list[str] | None] = _Validator(added="1.2")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/metadata.py:857** - Possível acesso a relação em serialização
  ```python
  requires: _Validator[list[str] | None] = _Validator(added="1.1")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/metadata.py:859** - Possível acesso a relação em serialização
  ```python
  provides: _Validator[list[str] | None] = _Validator(added="1.1")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/metadata.py:861** - Possível acesso a relação em serialização
  ```python
  obsoletes: _Validator[list[str] | None] = _Validator(added="1.1")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/version.py:152** - Acesso a atributo de relação em loop
  ```python
  The pattern is not anchored at either end, and is intended for embedding in larger
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/version.py:167** - Possível acesso a relação em serialização
  ```python
  >>> v1 = Version("1.0a5")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/version.py:168** - Possível acesso a relação em serialização
  ```python
  >>> v2 = Version("1.0")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/version.py:170** - Possível acesso a relação em serialização
  ```python
  <Version('1.0a5')>
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/version.py:172** - Possível acesso a relação em serialização
  ```python
  <Version('1.0')>
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/version.py:237** - Possível acesso a relação em serialização
  ```python
  >>> str(Version("1.0a5"))
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/version.py:238** - Possível acesso a relação em serialização
  ```python
  '1.0a5'
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/version.py:462** - Possível acesso a relação em serialização
  ```python
  >>> _TrimmedRelease('0.0').release
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/__init__.py:9** - Possível acesso a relação em serialização
  ```python
  __version__ = "25.0"
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/markers.py:157** - Acesso a atributo de relação em loop
  ```python
  inner = (_format_marker(m, first=False) for m in marker)
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/markers.py:110** - Possível acesso a relação em serialização
  ```python
  """The Python version as string ``'major.minor'``."""
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/markers.py:285** - Possível acesso a relação em serialização
  ```python
  # python_version > "3.6" or (python_version == "3.6" and os_name == "unix")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/markers.py:285** - Possível acesso a relação em serialização
  ```python
  # python_version > "3.6" or (python_version == "3.6" and os_name == "unix")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/markers.py:289** - Possível acesso a relação em serialização
  ```python
  #     (<Variable('python_version')>, <Op('>')>, <Value('3.6')>),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/markers.py:292** - Possível acesso a relação em serialização
  ```python
  #         (<Variable('python_version')>, <Op('==')>, <Value('3.6')>),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/_manylinux.py:69** - Acesso a atributo de relação em loop
  ```python
  return any(arch in allowed_archs for arch in archs)
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/_manylinux.py:138** - Possível acesso a relação em serialização
  ```python
  # Call gnu_get_libc_version, which returns a string like "2.5"
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/specifiers.py:602** - Acesso a atributo de relação em loop
  ```python
  for version in iterable:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/specifiers.py:551** - Possível acesso a relação em serialização
  ```python
  # "2.0" in Specifier(">=2")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/specifiers.py:583** - Possível acesso a relação em serialização
  ```python
  >>> list(Specifier(">=1.2.3").filter(["1.2", "1.3", "1.5a1"]))
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/specifiers.py:583** - Possível acesso a relação em serialização
  ```python
  >>> list(Specifier(">=1.2.3").filter(["1.2", "1.3", "1.5a1"]))
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/specifiers.py:583** - Possível acesso a relação em serialização
  ```python
  >>> list(Specifier(">=1.2.3").filter(["1.2", "1.3", "1.5a1"]))
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/specifiers.py:584** - Possível acesso a relação em serialização
  ```python
  ['1.3']
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/specifiers.py:585** - Possível acesso a relação em serialização
  ```python
  >>> list(Specifier(">=1.2.3").filter(["1.2", "1.2.3", "1.3", Version("1.4")]))
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/specifiers.py:585** - Possível acesso a relação em serialização
  ```python
  >>> list(Specifier(">=1.2.3").filter(["1.2", "1.2.3", "1.3", Version("1.4")]))
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/specifiers.py:585** - Possível acesso a relação em serialização
  ```python
  >>> list(Specifier(">=1.2.3").filter(["1.2", "1.2.3", "1.3", Version("1.4")]))
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/specifiers.py:586** - Possível acesso a relação em serialização
  ```python
  ['1.2.3', '1.3', <Version('1.4')>]
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/specifiers.py:586** - Possível acesso a relação em serialização
  ```python
  ['1.2.3', '1.3', <Version('1.4')>]
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/specifiers.py:587** - Possível acesso a relação em serialização
  ```python
  >>> list(Specifier(">=1.2.3").filter(["1.2", "1.5a1"]))
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/specifiers.py:587** - Possível acesso a relação em serialização
  ```python
  >>> list(Specifier(">=1.2.3").filter(["1.2", "1.5a1"]))
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/specifiers.py:588** - Possível acesso a relação em serialização
  ```python
  ['1.5a1']
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/specifiers.py:589** - Possível acesso a relação em serialização
  ```python
  >>> list(Specifier(">=1.2.3").filter(["1.3", "1.5a1"], prereleases=True))
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/specifiers.py:589** - Possível acesso a relação em serialização
  ```python
  >>> list(Specifier(">=1.2.3").filter(["1.3", "1.5a1"], prereleases=True))
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/specifiers.py:590** - Possível acesso a relação em serialização
  ```python
  ['1.3', '1.5a1']
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/specifiers.py:590** - Possível acesso a relação em serialização
  ```python
  ['1.3', '1.5a1']
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/specifiers.py:591** - Possível acesso a relação em serialização
  ```python
  >>> list(Specifier(">=1.2.3", prereleases=True).filter(["1.3", "1.5a1"]))
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/specifiers.py:591** - Possível acesso a relação em serialização
  ```python
  >>> list(Specifier(">=1.2.3", prereleases=True).filter(["1.3", "1.5a1"]))
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/specifiers.py:592** - Possível acesso a relação em serialização
  ```python
  ['1.3', '1.5a1']
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/specifiers.py:592** - Possível acesso a relação em serialização
  ```python
  ['1.3', '1.5a1']
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/specifiers.py:960** - Possível acesso a relação em serialização
  ```python
  >>> list(SpecifierSet(">=1.2.3").filter(["1.2", "1.3", "1.5a1"]))
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/specifiers.py:960** - Possível acesso a relação em serialização
  ```python
  >>> list(SpecifierSet(">=1.2.3").filter(["1.2", "1.3", "1.5a1"]))
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/specifiers.py:960** - Possível acesso a relação em serialização
  ```python
  >>> list(SpecifierSet(">=1.2.3").filter(["1.2", "1.3", "1.5a1"]))
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/specifiers.py:961** - Possível acesso a relação em serialização
  ```python
  ['1.3']
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/specifiers.py:962** - Possível acesso a relação em serialização
  ```python
  >>> list(SpecifierSet(">=1.2.3").filter(["1.2", "1.3", Version("1.4")]))
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/specifiers.py:962** - Possível acesso a relação em serialização
  ```python
  >>> list(SpecifierSet(">=1.2.3").filter(["1.2", "1.3", Version("1.4")]))
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/specifiers.py:962** - Possível acesso a relação em serialização
  ```python
  >>> list(SpecifierSet(">=1.2.3").filter(["1.2", "1.3", Version("1.4")]))
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/specifiers.py:963** - Possível acesso a relação em serialização
  ```python
  ['1.3', <Version('1.4')>]
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/specifiers.py:963** - Possível acesso a relação em serialização
  ```python
  ['1.3', <Version('1.4')>]
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/specifiers.py:964** - Possível acesso a relação em serialização
  ```python
  >>> list(SpecifierSet(">=1.2.3").filter(["1.2", "1.5a1"]))
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/specifiers.py:964** - Possível acesso a relação em serialização
  ```python
  >>> list(SpecifierSet(">=1.2.3").filter(["1.2", "1.5a1"]))
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/specifiers.py:966** - Possível acesso a relação em serialização
  ```python
  >>> list(SpecifierSet(">=1.2.3").filter(["1.3", "1.5a1"], prereleases=True))
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/specifiers.py:966** - Possível acesso a relação em serialização
  ```python
  >>> list(SpecifierSet(">=1.2.3").filter(["1.3", "1.5a1"], prereleases=True))
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/specifiers.py:967** - Possível acesso a relação em serialização
  ```python
  ['1.3', '1.5a1']
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/specifiers.py:967** - Possível acesso a relação em serialização
  ```python
  ['1.3', '1.5a1']
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/specifiers.py:968** - Possível acesso a relação em serialização
  ```python
  >>> list(SpecifierSet(">=1.2.3", prereleases=True).filter(["1.3", "1.5a1"]))
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/specifiers.py:968** - Possível acesso a relação em serialização
  ```python
  >>> list(SpecifierSet(">=1.2.3", prereleases=True).filter(["1.3", "1.5a1"]))
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/specifiers.py:969** - Possível acesso a relação em serialização
  ```python
  ['1.3', '1.5a1']
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/specifiers.py:969** - Possível acesso a relação em serialização
  ```python
  ['1.3', '1.5a1']
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/specifiers.py:974** - Possível acesso a relação em serialização
  ```python
  >>> list(SpecifierSet("").filter(["1.3", "1.5a1"]))
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/specifiers.py:974** - Possível acesso a relação em serialização
  ```python
  >>> list(SpecifierSet("").filter(["1.3", "1.5a1"]))
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/specifiers.py:975** - Possível acesso a relação em serialização
  ```python
  ['1.3']
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/specifiers.py:976** - Possível acesso a relação em serialização
  ```python
  >>> list(SpecifierSet("").filter(["1.5a1"]))
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/specifiers.py:977** - Possível acesso a relação em serialização
  ```python
  ['1.5a1']
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/specifiers.py:978** - Possível acesso a relação em serialização
  ```python
  >>> list(SpecifierSet("", prereleases=True).filter(["1.3", "1.5a1"]))
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/specifiers.py:978** - Possível acesso a relação em serialização
  ```python
  >>> list(SpecifierSet("", prereleases=True).filter(["1.3", "1.5a1"]))
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/specifiers.py:979** - Possível acesso a relação em serialização
  ```python
  ['1.3', '1.5a1']
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/specifiers.py:979** - Possível acesso a relação em serialização
  ```python
  ['1.3', '1.5a1']
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/specifiers.py:980** - Possível acesso a relação em serialização
  ```python
  >>> list(SpecifierSet("").filter(["1.3", "1.5a1"], prereleases=True))
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/specifiers.py:980** - Possível acesso a relação em serialização
  ```python
  >>> list(SpecifierSet("").filter(["1.3", "1.5a1"], prereleases=True))
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/specifiers.py:981** - Possível acesso a relação em serialização
  ```python
  ['1.3', '1.5a1']
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/specifiers.py:981** - Possível acesso a relação em serialização
  ```python
  ['1.3', '1.5a1']
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/packaging/_elffile.py:99** - Acesso a atributo de relação em loop
  ```python
  for index in range(self._e_phnum):
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/truststore/_openssl.py:41** - Acesso a atributo de relação em loop
  ```python
  for cafile in _CA_FILE_CANDIDATES:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/truststore/_macos.py:349** - Acesso a atributo de relação em loop
  ```python
  for cert_data in certs:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/truststore/_windows.py:339** - Acesso a atributo de relação em loop
  ```python
  for cert_bytes in cert_chain[1:]:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/truststore/_windows.py:234** - Possível acesso a relação em serialização
  ```python
  wincrypt = WinDLL("crypt32.dll")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/truststore/_windows.py:235** - Possível acesso a relação em serialização
  ```python
  kernel32 = WinDLL("kernel32.dll")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/msgpack/fallback.py:205** - Acesso a atributo de relação em loop
  ```python
  for o in unpacker:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/dependency_groups/_lint_dependency_groups.py:27** - Possível acesso a relação em serialização
  ```python
  default="pyproject.toml",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/dependency_groups/_pip_wrapper.py:30** - Possível acesso a relação em serialização
  ```python
  default="pyproject.toml",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/dependency_groups/_implementation.py:138** - Loop com query de relação
  ```python
  for item in raw_group:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/dependency_groups/_implementation.py:138** - Acesso a atributo de relação em loop
  ```python
  for item in raw_group:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/dependency_groups/__main__.py:27** - Possível acesso a relação em serialização
  ```python
  default="pyproject.toml",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pygments/token.py:115** - Acesso a atributo de relação em loop
  ```python
  for item in s.split('.'):
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pygments/token.py:98** - Possível acesso a relação em serialização
  ```python
  >>> string_to_token('String.Double')
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pygments/style.py:62** - Loop com query de relação
  ```python
  for token in STANDARD_TYPES:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pygments/style.py:62** - Acesso a atributo de relação em loop
  ```python
  for token in STANDARD_TYPES:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pygments/util.py:114** - Acesso a atributo de relação em loop
  ```python
  for line in obj.__doc__.strip().splitlines():
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pygments/sphinxext.py:86** - Acesso a atributo de relação em loop
  ```python
  for fn in self.filenames:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pygments/unistring.py:6** - Acesso a atributo de relação em loop
  ```python
  Used for matching in Unicode-aware languages. Run to regenerate.
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pygments/lexer.py:172** - Loop com query de relação
  ```python
  for filter_ in get_list_opt(options, 'filters', ()):
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pygments/lexer.py:172** - Acesso a atributo de relação em loop
  ```python
  for filter_ in get_list_opt(options, 'filters', ()):
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pygments/plugin.py:37** - Possível acesso a relação em serialização
  ```python
  LEXER_ENTRY_POINT = 'pygments.lexers'
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pygments/plugin.py:38** - Possível acesso a relação em serialização
  ```python
  FORMATTER_ENTRY_POINT = 'pygments.formatters'
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pygments/plugin.py:39** - Possível acesso a relação em serialização
  ```python
  STYLE_ENTRY_POINT = 'pygments.styles'
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pygments/plugin.py:40** - Possível acesso a relação em serialização
  ```python
  FILTER_ENTRY_POINT = 'pygments.filters'
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pygments/filter.py:20** - Acesso a atributo de relação em loop
  ```python
  for filter_ in filters:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pygments/filters/__init__.py:55** - Acesso a atributo de relação em loop
  ```python
  for match in regex.finditer(value):
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pygments/lexers/__init__.py:46** - Acesso a atributo de relação em loop
  ```python
  for lexer_name in mod.__all__:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pygments/lexers/python.py:226** - Acesso a atributo de relação em loop
  ```python
  r'|'.join(k for k in keyword.kwlist if k[0].islower()) + r')\b))',
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pygments/lexers/python.py:54** - Possível acesso a relação em serialização
  ```python
  'BUILD.bazel',
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pygments/lexers/python.py:61** - Possível acesso a relação em serialização
  ```python
  version_added = '0.10'
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pygments/lexers/python.py:739** - Possível acesso a relação em serialização
  ```python
  version_added = '1.0'
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pygments/lexers/python.py:796** - Possível acesso a relação em serialização
  ```python
  version_added = '0.7'
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pygments/lexers/python.py:840** - Possível acesso a relação em serialização
  ```python
  version_added = '1.1'
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pygments/lexers/python.py:1020** - Possível acesso a relação em serialização
  ```python
  version_added = '1.6'
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pygments/lexers/python.py:1116** - Possível acesso a relação em serialização
  ```python
  version_added = '0.10'
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pygments/lexers/_mapping.py:29** - Possível acesso a relação em serialização
  ```python
  'ApacheConfLexer': ('pip._vendor.pygments.lexers.configs', 'ApacheConf', ('apacheconf', 'aconf', 'apache'), ('.htaccess', 'apache.conf', 'apache2.conf'), ('text/x-apacheconf',)),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pygments/lexers/_mapping.py:29** - Possível acesso a relação em serialização
  ```python
  'ApacheConfLexer': ('pip._vendor.pygments.lexers.configs', 'ApacheConf', ('apacheconf', 'aconf', 'apache'), ('.htaccess', 'apache.conf', 'apache2.conf'), ('text/x-apacheconf',)),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pygments/lexers/_mapping.py:35** - Possível acesso a relação em serialização
  ```python
  'Asn1Lexer': ('pip._vendor.pygments.lexers.asn1', 'ASN.1', ('asn1',), ('*.asn1',), ()),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pygments/lexers/_mapping.py:67** - Possível acesso a relação em serialização
  ```python
  'CMakeLexer': ('pip._vendor.pygments.lexers.make', 'CMake', ('cmake',), ('*.cmake', 'CMakeLists.txt'), ('text/x-cmake',)),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pygments/lexers/_mapping.py:131** - Possível acesso a relação em serialização
  ```python
  'DebianSourcesLexer': ('pip._vendor.pygments.lexers.installers', 'Debian Sources file', ('debian.sources',), ('*.sources',), ()),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pygments/lexers/_mapping.py:257** - Possível acesso a relação em serialização
  ```python
  'JsonLexer': ('pip._vendor.pygments.lexers.data', 'JSON', ('json', 'json-object'), ('*.json', '*.jsonl', '*.ndjson', 'Pipfile.lock'), ('application/json', 'application/json-object', 'application/x-ndjson', 'application/jsonl', 'application/json-seq')),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pygments/lexers/_mapping.py:278** - Possível acesso a relação em serialização
  ```python
  'LdaprcLexer': ('pip._vendor.pygments.lexers.ldap', 'LDAP configuration file', ('ldapconf', 'ldaprc'), ('.ldaprc', 'ldaprc', 'ldap.conf'), ('text/x-ldapconf',)),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pygments/lexers/_mapping.py:283** - Possível acesso a relação em serialização
  ```python
  'LighttpdConfLexer': ('pip._vendor.pygments.lexers.configs', 'Lighttpd configuration file', ('lighttpd', 'lighty'), ('lighttpd.conf',), ('text/x-lighttpd-conf',)),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pygments/lexers/_mapping.py:321** - Possível acesso a relação em serialização
  ```python
  'MesonLexer': ('pip._vendor.pygments.lexers.meson', 'Meson', ('meson', 'meson.build'), ('meson.build', 'meson_options.txt'), ('text/x-meson',)),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pygments/lexers/_mapping.py:321** - Possível acesso a relação em serialização
  ```python
  'MesonLexer': ('pip._vendor.pygments.lexers.meson', 'Meson', ('meson', 'meson.build'), ('meson.build', 'meson_options.txt'), ('text/x-meson',)),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pygments/lexers/_mapping.py:321** - Possível acesso a relação em serialização
  ```python
  'MesonLexer': ('pip._vendor.pygments.lexers.meson', 'Meson', ('meson', 'meson.build'), ('meson.build', 'meson_options.txt'), ('text/x-meson',)),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pygments/lexers/_mapping.py:356** - Possível acesso a relação em serialização
  ```python
  'NginxConfLexer': ('pip._vendor.pygments.lexers.configs', 'Nginx configuration file', ('nginx',), ('nginx.conf',), ('text/x-nginx-conf',)),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pygments/lexers/_mapping.py:379** - Possível acesso a relação em serialização
  ```python
  'PacmanConfLexer': ('pip._vendor.pygments.lexers.configs', 'PacmanConf', ('pacmanconf',), ('pacman.conf',), ()),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pygments/lexers/_mapping.py:419** - Possível acesso a relação em serialização
  ```python
  'PythonLexer': ('pip._vendor.pygments.lexers.python', 'Python', ('python', 'py', 'sage', 'python3', 'py3', 'bazel', 'starlark', 'pyi'), ('*.py', '*.pyw', '*.pyi', '*.jy', '*.sage', '*.sc', 'SConstruct', 'SConscript', '*.bzl', 'BUCK', 'BUILD', 'BUILD.bazel', 'WORKSPACE', '*.tac'), ('text/x-python', 'application/x-python', 'text/x-python3', 'application/x-python3')),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pygments/lexers/_mapping.py:492** - Possível acesso a relação em serialização
  ```python
  'SoongLexer': ('pip._vendor.pygments.lexers.soong', 'Soong', ('androidbp', 'bp', 'soong'), ('Android.bp',), ()),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pygments/lexers/_mapping.py:495** - Possível acesso a relação em serialização
  ```python
  'SourcesListLexer': ('pip._vendor.pygments.lexers.installers', 'Debian Sourcelist', ('debsources', 'sourceslist', 'sources.list'), ('sources.list',), ()),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pygments/lexers/_mapping.py:495** - Possível acesso a relação em serialização
  ```python
  'SourcesListLexer': ('pip._vendor.pygments.lexers.installers', 'Debian Sourcelist', ('debsources', 'sourceslist', 'sources.list'), ('sources.list',), ()),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pygments/lexers/_mapping.py:501** - Possível acesso a relação em serialização
  ```python
  'SquidConfLexer': ('pip._vendor.pygments.lexers.configs', 'SquidConf', ('squidconf', 'squid.conf', 'squid'), ('squid.conf',), ('text/x-squidconf',)),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pygments/lexers/_mapping.py:501** - Possível acesso a relação em serialização
  ```python
  'SquidConfLexer': ('pip._vendor.pygments.lexers.configs', 'SquidConf', ('squidconf', 'squid.conf', 'squid'), ('squid.conf',), ('text/x-squidconf',)),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pygments/lexers/_mapping.py:513** - Possível acesso a relação em serialização
  ```python
  'TOMLLexer': ('pip._vendor.pygments.lexers.configs', 'TOML', ('toml',), ('*.toml', 'Pipfile', 'poetry.lock'), ('application/toml',)),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pygments/lexers/_mapping.py:525** - Possível acesso a relação em serialização
  ```python
  'TermcapLexer': ('pip._vendor.pygments.lexers.configs', 'Termcap', ('termcap',), ('termcap', 'termcap.src'), ()),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pygments/lexers/_mapping.py:526** - Possível acesso a relação em serialização
  ```python
  'TerminfoLexer': ('pip._vendor.pygments.lexers.configs', 'Terminfo', ('terminfo',), ('terminfo', 'terminfo.src'), ()),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pygments/lexers/_mapping.py:535** - Possível acesso a relação em serialização
  ```python
  'TodotxtLexer': ('pip._vendor.pygments.lexers.textfmts', 'Todotxt', ('todotxt',), ('todo.txt', '*.todotxt'), ('text/x-todo',)),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pygments/lexers/_mapping.py:561** - Possível acesso a relação em serialização
  ```python
  'VbNetLexer': ('pip._vendor.pygments.lexers.dotnet', 'VB.net', ('vb.net', 'vbnet', 'lobas', 'oobas', 'sobas', 'visual-basic', 'visualbasic'), ('*.vb', '*.bas'), ('text/x-vbnet', 'text/x-vba')),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pygments/lexers/_mapping.py:561** - Possível acesso a relação em serialização
  ```python
  'VbNetLexer': ('pip._vendor.pygments.lexers.dotnet', 'VB.net', ('vb.net', 'vbnet', 'lobas', 'oobas', 'sobas', 'visual-basic', 'visualbasic'), ('*.vb', '*.bas'), ('text/x-vbnet', 'text/x-vba')),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pygments/lexers/_mapping.py:589** - Possível acesso a relação em serialização
  ```python
  'XorgLexer': ('pip._vendor.pygments.lexers.xorg', 'Xorg', ('xorg.conf',), ('xorg.conf',), ()),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pygments/lexers/_mapping.py:589** - Possível acesso a relação em serialização
  ```python
  'XorgLexer': ('pip._vendor.pygments.lexers.xorg', 'Xorg', ('xorg.conf',), ('xorg.conf',), ()),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pygments/formatters/__init__.py:39** - Acesso a atributo de relação em loop
  ```python
  for formatter_name in mod.__all__:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pygments/formatters/_mapping.py:19** - Acesso a atributo de relação em loop
  ```python
  'Terminal256Formatter': ('pygments.formatters.terminal256', 'Terminal256', ('terminal256', 'console256', '256'), (), 'Format tokens with ANSI color sequences, for output in a 256-color terminal or console.  Like in `TerminalFormatter` color sequences are terminated at newlines, so that paging the output works correctly.'),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/locators.py:68** - Loop com query de relação
  ```python
  for key in ('location', 'uri'):
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/locators.py:68** - Acesso a atributo de relação em loop
  ```python
  for key in ('location', 'uri'):
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/locators.py:200** - Possível acesso a relação em serialização
  ```python
  return (t.scheme == 'https', 'pypi.org' in t.netloc, is_downloadable, is_wheel, compatible, basename)
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/locators.py:767** - Possível acesso a relação em serialização
  ```python
  url = urljoin(ensure_slash(url), 'index.html')
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/metadata.py:112** - Loop com query de relação
  ```python
  return _345_FIELDS + tuple(f for f in _566_FIELDS if f not in _345_FIELDS)
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/metadata.py:112** - Acesso a atributo de relação em loop
  ```python
  return _345_FIELDS + tuple(f for f in _566_FIELDS if f not in _345_FIELDS)
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/metadata.py:51** - Possível acesso a relação em serialização
  ```python
  PKG_INFO_PREFERRED_VERSION = '1.1'
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/metadata.py:104** - Possível acesso a relação em serialização
  ```python
  if version == '1.0':
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/metadata.py:106** - Possível acesso a relação em serialização
  ```python
  elif version == '1.1':
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/metadata.py:108** - Possível acesso a relação em serialização
  ```python
  elif version == '1.2':
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/metadata.py:110** - Possível acesso a relação em serialização
  ```python
  elif version in ('1.3', '2.1'):
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/metadata.py:110** - Possível acesso a relação em serialização
  ```python
  elif version in ('1.3', '2.1'):
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/metadata.py:113** - Possível acesso a relação em serialização
  ```python
  elif version == '2.0':
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/metadata.py:116** - Possível acesso a relação em serialização
  ```python
  elif version == '2.2':
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/metadata.py:128** - Possível acesso a relação em serialização
  ```python
  possible_versions = ['1.0', '1.1', '1.2', '1.3', '2.1', '2.2']  # 2.0 removed
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/metadata.py:128** - Possível acesso a relação em serialização
  ```python
  possible_versions = ['1.0', '1.1', '1.2', '1.3', '2.1', '2.2']  # 2.0 removed
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/metadata.py:128** - Possível acesso a relação em serialização
  ```python
  possible_versions = ['1.0', '1.1', '1.2', '1.3', '2.1', '2.2']  # 2.0 removed
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/metadata.py:128** - Possível acesso a relação em serialização
  ```python
  possible_versions = ['1.0', '1.1', '1.2', '1.3', '2.1', '2.2']  # 2.0 removed
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/metadata.py:128** - Possível acesso a relação em serialização
  ```python
  possible_versions = ['1.0', '1.1', '1.2', '1.3', '2.1', '2.2']  # 2.0 removed
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/metadata.py:128** - Possível acesso a relação em serialização
  ```python
  possible_versions = ['1.0', '1.1', '1.2', '1.3', '2.1', '2.2']  # 2.0 removed
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/metadata.py:132** - Possível acesso a relação em serialização
  ```python
  if key not in _241_FIELDS and '1.0' in possible_versions:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/metadata.py:133** - Possível acesso a relação em serialização
  ```python
  possible_versions.remove('1.0')
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/metadata.py:135** - Possível acesso a relação em serialização
  ```python
  if key not in _314_FIELDS and '1.1' in possible_versions:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/metadata.py:136** - Possível acesso a relação em serialização
  ```python
  possible_versions.remove('1.1')
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/metadata.py:138** - Possível acesso a relação em serialização
  ```python
  if key not in _345_FIELDS and '1.2' in possible_versions:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/metadata.py:139** - Possível acesso a relação em serialização
  ```python
  possible_versions.remove('1.2')
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/metadata.py:141** - Possível acesso a relação em serialização
  ```python
  if key not in _566_FIELDS and '1.3' in possible_versions:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/metadata.py:142** - Possível acesso a relação em serialização
  ```python
  possible_versions.remove('1.3')
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/metadata.py:144** - Possível acesso a relação em serialização
  ```python
  if key not in _566_FIELDS and '2.1' in possible_versions:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/metadata.py:146** - Possível acesso a relação em serialização
  ```python
  possible_versions.remove('2.1')
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/metadata.py:148** - Possível acesso a relação em serialização
  ```python
  if key not in _643_FIELDS and '2.2' in possible_versions:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/metadata.py:149** - Possível acesso a relação em serialização
  ```python
  possible_versions.remove('2.2')
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/metadata.py:151** - Possível acesso a relação em serialização
  ```python
  # if key not in _426_FIELDS and '2.0' in possible_versions:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/metadata.py:152** - Possível acesso a relação em serialização
  ```python
  # possible_versions.remove('2.0')
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/metadata.py:163** - Possível acesso a relação em serialização
  ```python
  is_1_1 = '1.1' in possible_versions and _has_marker(keys, _314_MARKERS)
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/metadata.py:164** - Possível acesso a relação em serialização
  ```python
  is_1_2 = '1.2' in possible_versions and _has_marker(keys, _345_MARKERS)
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/metadata.py:165** - Possível acesso a relação em serialização
  ```python
  is_2_1 = '2.1' in possible_versions and _has_marker(keys, _566_MARKERS)
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/metadata.py:166** - Possível acesso a relação em serialização
  ```python
  # is_2_0 = '2.0' in possible_versions and _has_marker(keys, _426_MARKERS)
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/metadata.py:167** - Possível acesso a relação em serialização
  ```python
  is_2_2 = '2.2' in possible_versions and _has_marker(keys, _643_MARKERS)
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/metadata.py:182** - Possível acesso a relação em serialização
  ```python
  return '1.1'
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/metadata.py:184** - Possível acesso a relação em serialização
  ```python
  return '1.2'
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/metadata.py:186** - Possível acesso a relação em serialização
  ```python
  return '2.1'
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/metadata.py:188** - Possível acesso a relação em serialização
  ```python
  # return '2.2'
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/metadata.py:190** - Possível acesso a relação em serialização
  ```python
  return '2.2'
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/metadata.py:290** - Possível acesso a relação em serialização
  ```python
  if self.metadata_version in ('1.0', '1.1'):
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/metadata.py:290** - Possível acesso a relação em serialização
  ```python
  if self.metadata_version in ('1.0', '1.1'):
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/metadata.py:378** - Possível acesso a relação em serialização
  ```python
  if self.metadata_version in ('1.0', '1.1'):
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/metadata.py:378** - Possível acesso a relação em serialização
  ```python
  if self.metadata_version in ('1.0', '1.1'):
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/metadata.py:507** - Possível acesso a relação em serialização
  ```python
  if self['Metadata-Version'] != '1.2':
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/metadata.py:552** - Possível acesso a relação em serialização
  ```python
  if self['Metadata-Version'] == '1.1':
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/metadata.py:579** - Possível acesso a relação em serialização
  ```python
  METADATA_FILENAME = 'pydist.json'
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/metadata.py:580** - Possível acesso a relação em serialização
  ```python
  WHEEL_METADATA_FILENAME = 'metadata.json'
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/metadata.py:601** - Possível acesso a relação em serialização
  ```python
  METADATA_VERSION = '2.0'
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/metadata.py:716** - Possível acesso a relação em serialização
  ```python
  result = d.get('python.commands', value)
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/metadata.py:718** - Possível acesso a relação em serialização
  ```python
  d = d.get('python.details')
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/metadata.py:722** - Possível acesso a relação em serialização
  ```python
  d = d.get('python.exports')
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/metadata.py:724** - Possível acesso a relação em serialização
  ```python
  d = self._data.get('python.exports')
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/metadata.py:762** - Possível acesso a relação em serialização
  ```python
  d['python.commands'] = value
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/metadata.py:764** - Possível acesso a relação em serialização
  ```python
  d = d.setdefault('python.details', {})
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/metadata.py:767** - Possível acesso a relação em serialização
  ```python
  d = d.setdefault('python.exports', {})
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/metadata.py:926** - Possível acesso a relação em serialização
  ```python
  ('extensions', 'python.details', 'license'): 'License',
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/metadata.py:929** - Possível acesso a relação em serialização
  ```python
  ('extensions', 'python.project', 'project_urls', 'Home'): 'Home-page',
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/metadata.py:930** - Possível acesso a relação em serialização
  ```python
  ('extensions', 'python.project', 'contacts', 0, 'name'): 'Author',
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/metadata.py:931** - Possível acesso a relação em serialização
  ```python
  ('extensions', 'python.project', 'contacts', 0, 'email'): 'Author-email',
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/metadata.py:933** - Possível acesso a relação em serialização
  ```python
  ('extensions', 'python.details', 'classifiers'): 'Classifier',
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/version.py:190** - Acesso a atributo de relação em loop
  ```python
  nums = tuple(int(v) for v in groups[1].split('.'))
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/version.py:400** - Possível acesso a relação em serialização
  ```python
  'pre.alpha'),                               # standardise
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/version.py:499** - Possível acesso a relação em serialização
  ```python
  # if we have something like "b-2" or "a.2" at the end of the
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/version.py:520** - Possível acesso a relação em serialização
  ```python
  # Clean a/b/c with no version. E.g. "1.0a" -> "1.0a0". Setuptools infers
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/version.py:520** - Possível acesso a relação em serialização
  ```python
  # Clean a/b/c with no version. E.g. "1.0a" -> "1.0a0". Setuptools infers
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/compat.py:139** - Loop com query de relação
  ```python
  for frag in remainder:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/compat.py:139** - Acesso a atributo de relação em loop
  ```python
  for frag in remainder:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/compat.py:244** - Possível acesso a relação em serialização
  ```python
  # This will allow us to short circuit when given "python.exe".
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/index.py:56** - Acesso a atributo de relação em loop
  ```python
  for s in ('gpg', 'gpg2'):
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/index.py:305** - Possível acesso a relação em serialização
  ```python
  fn = os.path.join(doc_dir, 'index.html')
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/manifest.py:75** - Acesso a atributo de relação em loop
  ```python
  for name in names:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/manifest.py:249** - Possível acesso a relação em serialização
  ```python
  """Select strings (presumably filenames) from 'self.files' that
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/manifest.py:258** - Possível acesso a relação em serialização
  ```python
  stringent: "*.py" will match "foo.py" but not "foo/bar.py".  If
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/manifest.py:294** - Possível acesso a relação em serialização
  ```python
  The list 'self.files' is modified in place. Return True if files are
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/util.py:264** - Loop com query de relação
  ```python
  rs = '%s %s' % (distname, ', '.join(['%s %s' % con for con in versions]))
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/util.py:264** - Acesso a atributo de relação em loop
  ```python
  rs = '%s %s' % (distname, ', '.join(['%s %s' % con for con in versions]))
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/util.py:357** - Possível acesso a relação em serialização
  ```python
  result = jdata['extensions']['python.exports']['exports']
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/util.py:1905** - Possível acesso a relação em serialização
  ```python
  For other non-POSIX platforms, currently just returns 'sys.platform'.
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/database.py:120** - Acesso a atributo de relação em loop
  ```python
  for path in self.path:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/database.py:560** - Possível acesso a relação em serialização
  ```python
  p = os.path.join(path, 'top_level.txt')
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/database.py:929** - Possível acesso a relação em serialização
  ```python
  req_path = os.path.join(p, 'requires.txt')
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/database.py:930** - Possível acesso a relação em serialização
  ```python
  tl_path = os.path.join(p, 'top_level.txt')
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/database.py:945** - Possível acesso a relação em serialização
  ```python
  req_path = os.path.join(path, 'requires.txt')
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/database.py:948** - Possível acesso a relação em serialização
  ```python
  tl_path = os.path.join(path, 'top_level.txt')
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/markers.py:41** - Acesso a atributo de relação em loop
  ```python
  return {LV(m.groups()[0]) for m in _VERSION_PATTERN.finditer(s)}
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/resources.py:180** - Loop com query de relação
  ```python
  return set([f for f in os.listdir(resource.path) if allowed(f)])
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/resources.py:180** - Acesso a atributo de relação em loop
  ```python
  return set([f for f in os.listdir(resource.path) if allowed(f)])
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/scripts.py:66** - Loop com query de relação
  ```python
  for r in finder(DISTLIB_PACKAGE).iterator("")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/scripts.py:66** - Acesso a atributo de relação em loop
  ```python
  for r in finder(DISTLIB_PACKAGE).iterator("")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/scripts.py:23** - Possível acesso a relação em serialização
  ```python
  <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/scripts.py:24** - Possível acesso a relação em serialização
  ```python
  <assembly xmlns="urn:schemas-microsoft-com:asm.v1" manifestVersion="1.0">
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/scripts.py:108** - Possível acesso a relação em serialização
  ```python
  self.variants = set(('', 'X.Y'))
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/scripts.py:140** - Possível acesso a relação em serialização
  ```python
  if java.lang.System.getProperty('os.name') == 'Linux':
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/scripts.py:142** - Possível acesso a relação em serialização
  ```python
  elif executable.lower().endswith('jython.exe'):
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/scripts.py:273** - Possível acesso a relação em serialização
  ```python
  zinfo = ZipInfo(filename='__main__.py', date_time=date_time)
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/scripts.py:276** - Possível acesso a relação em serialização
  ```python
  zf.writestr('__main__.py', script_bytes)
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/scripts.py:322** - Possível acesso a relação em serialização
  ```python
  if 'X.Y' in self.variants:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/wheel.py:116** - Acesso a atributo de relação em loop
  ```python
  return [s[0] for s in imp.get_suffixes()]
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/wheel.py:194** - Possível acesso a relação em serialização
  ```python
  self.version = '0.1'
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/wheel.py:661** - Possível acesso a relação em serialização
  ```python
  if file_version == '1.0':
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/wheel.py:663** - Possível acesso a relação em serialização
  ```python
  ep = posixpath.join(info_dir, 'entry_points.txt')
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distlib/wheel.py:687** - Possível acesso a relação em serialização
  ```python
  commands = commands.get('python.commands')
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distro/distro.py:914** - Loop com query de relação
  ```python
  for v in versions:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distro/distro.py:914** - Acesso a atributo de relação em loop
  ```python
  for v in versions:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distro/distro.py:332** - Possível acesso a relação em serialização
  ```python
  "7.0").
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/distro/distro.py:480** - Possível acesso a relação em serialização
  ```python
  'version': '7.0',
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/cachecontrol/serialize.py:53** - Loop com query de relação
  ```python
  for header in varied_headers:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/cachecontrol/serialize.py:53** - Acesso a atributo de relação em loop
  ```python
  for header in varied_headers:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/cachecontrol/controller.py:110** - Loop com query de relação
  ```python
  for cc_directive in cc_headers.split(","):
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/cachecontrol/controller.py:110** - Acesso a atributo de relação em loop
  ```python
  for cc_directive in cc_headers.split(","):
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/cachecontrol/caches/redis_cache.py:43** - Acesso a atributo de relação em loop
  ```python
  for key in self.conn.keys():
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/idna/package_data.py:1** - Possível acesso a relação em serialização
  ```python
  __version__ = "3.10"
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/idna/core.py:168** - Loop com query de relação
  ```python
  for i in range(pos - 1, -1, -1):
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/idna/core.py:168** - Acesso a atributo de relação em loop
  ```python
  for i in range(pos - 1, -1, -1):
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/requests/cookies.py:157** - Acesso a atributo de relação em loop
  ```python
  for cookie in cookiejar:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/requests/sessions.py:85** - Loop com query de relação
  ```python
  for key in none_keys:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/requests/sessions.py:85** - Acesso a atributo de relação em loop
  ```python
  for key in none_keys:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/requests/models.py:124** - Loop com query de relação
  ```python
  for v in vs:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/requests/models.py:124** - Acesso a atributo de relação em loop
  ```python
  for v in vs:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/requests/packages.py:8** - Acesso a atributo de relação em loop
  ```python
  for package in ("urllib3", "idna"):
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/requests/utils.py:103** - Loop com query de relação
  ```python
  for test in proxyOverride:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/requests/utils.py:103** - Acesso a atributo de relação em loop
  ```python
  for test in proxyOverride:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/requests/adapters.py:225** - Acesso a atributo de relação em loop
  ```python
  return {attr: getattr(self, attr, None) for attr in self.__attrs__}
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/tomli/_parser.py:35** - Acesso a atributo de relação em loop
  ```python
  ASCII_CTRL: Final = frozenset(chr(i) for i in range(32)) | frozenset(chr(127))
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/tomli/_parser.py:137** - Possível acesso a relação em serialização
  ```python
  "File must be opened in binary mode, e.g. use `open('foo.toml', 'rb')`"
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/certifi/core.py:40** - Possível acesso a relação em serialização
  ```python
  _CACERT_CTX = as_file(files("pip._vendor.certifi").joinpath("cacert.pem"))
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/certifi/core.py:47** - Possível acesso a relação em serialização
  ```python
  return files("pip._vendor.certifi").joinpath("cacert.pem").read_text(encoding="ascii")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/certifi/core.py:76** - Possível acesso a relação em serialização
  ```python
  _CACERT_CTX = get_path("pip._vendor.certifi", "cacert.pem")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/certifi/core.py:83** - Possível acesso a relação em serialização
  ```python
  return read_text("pip._vendor.certifi", "cacert.pem", encoding="ascii")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/certifi/core.py:91** - Possível acesso a relação em serialização
  ```python
  Resource = Union[str, "os.PathLike"]
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/certifi/core.py:111** - Possível acesso a relação em serialização
  ```python
  return os.path.join(f, "cacert.pem")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/certifi/core.py:114** - Possível acesso a relação em serialização
  ```python
  return read_text("pip._vendor.certifi", "cacert.pem", encoding="ascii")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pyproject_hooks/_impl.py:151** - Acesso a atributo de relação em loop
  ```python
  backend_path = [norm_and_check(self.source_dir, p) for p in backend_path]
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pyproject_hooks/_impl.py:387** - Possível acesso a relação em serialização
  ```python
  write_json(hook_input, pjoin(td, "input.json"), indent=2)
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pyproject_hooks/_impl.py:398** - Possível acesso a relação em serialização
  ```python
  data = read_json(pjoin(td, "output.json"))
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pyproject_hooks/_in_process/_in_process.py:76** - Acesso a atributo de relação em loop
  ```python
  for path_part in obj_path.split("."):
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pyproject_hooks/_in_process/_in_process.py:369** - Possível acesso a relação em serialização
  ```python
  hook_input = read_json(pjoin(control_dir, "input.json"))
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pyproject_hooks/_in_process/_in_process.py:385** - Possível acesso a relação em serialização
  ```python
  write_json(json_out, pjoin(control_dir, "output.json"), indent=2)
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pyproject_hooks/_in_process/__init__.py:14** - Possível acesso a relação em serialização
  ```python
  return resources.path(__package__, "_in_process.py")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pyproject_hooks/_in_process/__init__.py:20** - Possível acesso a relação em serialização
  ```python
  resources.files(__package__).joinpath("_in_process.py")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/logging.py:203** - Possível acesso a relação em serialização
  ```python
  message_text.highlight_words(self.keywords, "logging.keyword")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/logging.py:268** - Possível acesso a relação em serialização
  ```python
  "version": "1.1",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/logging.py:273** - Possível acesso a relação em serialização
  ```python
  {"version": "1.1", "result": True, "error": None, "id": "194521489"},
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/tree.py:142** - Acesso a atributo de relação em loop
  ```python
  - sum(level.cell_length for level in prefix),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/tree.py:24** - Possível acesso a relação em serialização
  ```python
  guide_style (StyleType, optional): Style of the guide lines. Defaults to "tree.line".
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/tree.py:42** - Possível acesso a relação em serialização
  ```python
  guide_style: StyleType = "tree.line",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/tree.py:69** - Possível acesso a relação em serialização
  ```python
  guide_style (StyleType, optional): Style of the guide lines. Defaults to "tree.line".
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/console.py:1023** - Loop com query de relação
  ```python
  for file_descriptor in streams:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/console.py:1023** - Acesso a atributo de relação em loop
  ```python
  for file_descriptor in streams:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/console.py:526** - Possível acesso a relação em serialização
  ```python
  "google.colab" in str(ipython.__class__)
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/console.py:1163** - Possível acesso a relação em serialização
  ```python
  spinner_style: StyleType = "status.spinner",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/console.py:1172** - Possível acesso a relação em serialização
  ```python
  spinner_style (StyleType, optional): Style of spinner. Defaults to "status.spinner".
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/console.py:1585** - Possível acesso a relação em serialização
  ```python
  style: Union[str, Style] = "rule.line",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/console.py:1593** - Possível acesso a relação em serialização
  ```python
  style (str, optional): Style of line. Defaults to "rule.line".
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/console.py:2633** - Possível acesso a relação em serialização
  ```python
  "jsonrpc": "2.0",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/live_render.py:102** - Possível acesso a relação em serialização
  ```python
  style="live.ellipsis",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/_emoji_codes.py:201** - Possível acesso a relação em serialização
  ```python
  "mrs._claus": "🤶",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/_emoji_codes.py:202** - Possível acesso a relação em serialização
  ```python
  "mrs._claus_dark_skin_tone": "🤶🏿",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/_emoji_codes.py:203** - Possível acesso a relação em serialização
  ```python
  "mrs._claus_light_skin_tone": "🤶🏻",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/_emoji_codes.py:206** - Possível acesso a relação em serialização
  ```python
  "mrs._claus_medium_skin_tone": "🤶🏽",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/_emoji_codes.py:284** - Possível acesso a relação em serialização
  ```python
  "st._barthélemy": "🇧🇱",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/_emoji_codes.py:285** - Possível acesso a relação em serialização
  ```python
  "st._helena": "🇸🇭",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/_emoji_codes.py:287** - Possível acesso a relação em serialização
  ```python
  "st._lucia": "🇱🇨",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/_emoji_codes.py:288** - Possível acesso a relação em serialização
  ```python
  "st._martin": "🇲🇫",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/_emoji_codes.py:3207** - Possível acesso a relação em serialização
  ```python
  "flag_for_st._barthélemy": "🇧🇱",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/_emoji_codes.py:3208** - Possível acesso a relação em serialização
  ```python
  "flag_for_st._helena": "🇸🇭",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/_emoji_codes.py:3210** - Possível acesso a relação em serialização
  ```python
  "flag_for_st._lucia": "🇱🇨",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/_emoji_codes.py:3211** - Possível acesso a relação em serialização
  ```python
  "flag_for_st._martin": "🇲🇫",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/box.py:480** - Possível acesso a relação em serialização
  ```python
  # console.save_svg("box.svg")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/color.py:478** - Acesso a atributo de relação em loop
  ```python
  if not all(component <= 255 for component in triplet):
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/align.py:156** - Acesso a atributo de relação em loop
  ```python
  for line in lines:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/style.py:360** - Acesso a atributo de relação em loop
  ```python
  for bit in range(4, 9):
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:39** - Possível acesso a relação em serialização
  ```python
  "inspect.attr": Style(color="yellow", italic=True),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:41** - Possível acesso a relação em serialização
  ```python
  "inspect.callable": Style(bold=True, color="red"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:42** - Possível acesso a relação em serialização
  ```python
  "inspect.async_def": Style(italic=True, color="bright_cyan"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:43** - Possível acesso a relação em serialização
  ```python
  "inspect.def": Style(italic=True, color="bright_cyan"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:44** - Possível acesso a relação em serialização
  ```python
  "inspect.class": Style(italic=True, color="bright_cyan"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:45** - Possível acesso a relação em serialização
  ```python
  "inspect.error": Style(bold=True, color="red"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:46** - Possível acesso a relação em serialização
  ```python
  "inspect.equals": Style(),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:47** - Possível acesso a relação em serialização
  ```python
  "inspect.help": Style(color="cyan"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:48** - Possível acesso a relação em serialização
  ```python
  "inspect.doc": Style(dim=True),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:50** - Possível acesso a relação em serialização
  ```python
  "live.ellipsis": Style(bold=True, color="red"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:53** - Possível acesso a relação em serialização
  ```python
  "logging.keyword": Style(bold=True, color="yellow"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:60** - Possível acesso a relação em serialização
  ```python
  "log.level": Style.null(),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:61** - Possível acesso a relação em serialização
  ```python
  "log.time": Style(color="cyan", dim=True),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:62** - Possível acesso a relação em serialização
  ```python
  "log.message": Style.null(),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:63** - Possível acesso a relação em serialização
  ```python
  "log.path": Style(dim=True),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:64** - Possível acesso a relação em serialização
  ```python
  "repr.ellipsis": Style(color="yellow"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:65** - Possível acesso a relação em serialização
  ```python
  "repr.indent": Style(color="green", dim=True),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:66** - Possível acesso a relação em serialização
  ```python
  "repr.error": Style(color="red", bold=True),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:67** - Possível acesso a relação em serialização
  ```python
  "repr.str": Style(color="green", italic=False, bold=False),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:68** - Possível acesso a relação em serialização
  ```python
  "repr.brace": Style(bold=True),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:69** - Possível acesso a relação em serialização
  ```python
  "repr.comma": Style(bold=True),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:70** - Possível acesso a relação em serialização
  ```python
  "repr.ipv4": Style(bold=True, color="bright_green"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:71** - Possível acesso a relação em serialização
  ```python
  "repr.ipv6": Style(bold=True, color="bright_green"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:72** - Possível acesso a relação em serialização
  ```python
  "repr.eui48": Style(bold=True, color="bright_green"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:73** - Possível acesso a relação em serialização
  ```python
  "repr.eui64": Style(bold=True, color="bright_green"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:74** - Possível acesso a relação em serialização
  ```python
  "repr.tag_start": Style(bold=True),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:75** - Possível acesso a relação em serialização
  ```python
  "repr.tag_name": Style(color="bright_magenta", bold=True),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:76** - Possível acesso a relação em serialização
  ```python
  "repr.tag_contents": Style(color="default"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:77** - Possível acesso a relação em serialização
  ```python
  "repr.tag_end": Style(bold=True),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:78** - Possível acesso a relação em serialização
  ```python
  "repr.attrib_name": Style(color="yellow", italic=False),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:79** - Possível acesso a relação em serialização
  ```python
  "repr.attrib_equal": Style(bold=True),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:80** - Possível acesso a relação em serialização
  ```python
  "repr.attrib_value": Style(color="magenta", italic=False),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:81** - Possível acesso a relação em serialização
  ```python
  "repr.number": Style(color="cyan", bold=True, italic=False),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:82** - Possível acesso a relação em serialização
  ```python
  "repr.number_complex": Style(color="cyan", bold=True, italic=False),  # same
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:83** - Possível acesso a relação em serialização
  ```python
  "repr.bool_true": Style(color="bright_green", italic=True),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:84** - Possível acesso a relação em serialização
  ```python
  "repr.bool_false": Style(color="bright_red", italic=True),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:85** - Possível acesso a relação em serialização
  ```python
  "repr.none": Style(color="magenta", italic=True),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:86** - Possível acesso a relação em serialização
  ```python
  "repr.url": Style(underline=True, color="bright_blue", italic=False, bold=False),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:87** - Possível acesso a relação em serialização
  ```python
  "repr.uuid": Style(color="bright_yellow", bold=False),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:88** - Possível acesso a relação em serialização
  ```python
  "repr.call": Style(color="magenta", bold=True),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:89** - Possível acesso a relação em serialização
  ```python
  "repr.path": Style(color="magenta"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:90** - Possível acesso a relação em serialização
  ```python
  "repr.filename": Style(color="bright_magenta"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:91** - Possível acesso a relação em serialização
  ```python
  "rule.line": Style(color="bright_green"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:92** - Possível acesso a relação em serialização
  ```python
  "rule.text": Style.null(),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:93** - Possível acesso a relação em serialização
  ```python
  "json.brace": Style(bold=True),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:94** - Possível acesso a relação em serialização
  ```python
  "json.bool_true": Style(color="bright_green", italic=True),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:95** - Possível acesso a relação em serialização
  ```python
  "json.bool_false": Style(color="bright_red", italic=True),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:96** - Possível acesso a relação em serialização
  ```python
  "json.null": Style(color="magenta", italic=True),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:97** - Possível acesso a relação em serialização
  ```python
  "json.number": Style(color="cyan", bold=True, italic=False),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:98** - Possível acesso a relação em serialização
  ```python
  "json.str": Style(color="green", italic=False, bold=False),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:99** - Possível acesso a relação em serialização
  ```python
  "json.key": Style(color="blue", bold=True),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:101** - Possível acesso a relação em serialização
  ```python
  "prompt.choices": Style(color="magenta", bold=True),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:102** - Possível acesso a relação em serialização
  ```python
  "prompt.default": Style(color="cyan", bold=True),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:103** - Possível acesso a relação em serialização
  ```python
  "prompt.invalid": Style(color="red"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:106** - Possível acesso a relação em serialização
  ```python
  "scope.border": Style(color="blue"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:107** - Possível acesso a relação em serialização
  ```python
  "scope.key": Style(color="yellow", italic=True),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:109** - Possível acesso a relação em serialização
  ```python
  "scope.equals": Style(color="red"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:110** - Possível acesso a relação em serialização
  ```python
  "table.header": Style(bold=True),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:111** - Possível acesso a relação em serialização
  ```python
  "table.footer": Style(bold=True),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:112** - Possível acesso a relação em serialização
  ```python
  "table.cell": Style.null(),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:113** - Possível acesso a relação em serialização
  ```python
  "table.title": Style(italic=True),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:114** - Possível acesso a relação em serialização
  ```python
  "table.caption": Style(italic=True, dim=True),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:115** - Possível acesso a relação em serialização
  ```python
  "traceback.error": Style(color="red", italic=True),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:117** - Possível acesso a relação em serialização
  ```python
  "traceback.border": Style(color="red"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:118** - Possível acesso a relação em serialização
  ```python
  "traceback.text": Style.null(),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:119** - Possível acesso a relação em serialização
  ```python
  "traceback.title": Style(color="red", bold=True),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:120** - Possível acesso a relação em serialização
  ```python
  "traceback.exc_type": Style(color="bright_red", bold=True),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:121** - Possível acesso a relação em serialização
  ```python
  "traceback.exc_value": Style.null(),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:122** - Possível acesso a relação em serialização
  ```python
  "traceback.offset": Style(color="bright_red", bold=True),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:123** - Possível acesso a relação em serialização
  ```python
  "traceback.error_range": Style(underline=True, bold=True),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:124** - Possível acesso a relação em serialização
  ```python
  "traceback.note": Style(color="green", bold=True),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:126** - Possível acesso a relação em serialização
  ```python
  "bar.back": Style(color="grey23"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:127** - Possível acesso a relação em serialização
  ```python
  "bar.complete": Style(color="rgb(249,38,114)"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:128** - Possível acesso a relação em serialização
  ```python
  "bar.finished": Style(color="rgb(114,156,31)"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:129** - Possível acesso a relação em serialização
  ```python
  "bar.pulse": Style(color="rgb(249,38,114)"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:130** - Possível acesso a relação em serialização
  ```python
  "progress.description": Style.null(),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:131** - Possível acesso a relação em serialização
  ```python
  "progress.filesize": Style(color="green"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:133** - Possível acesso a relação em serialização
  ```python
  "progress.download": Style(color="green"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:134** - Possível acesso a relação em serialização
  ```python
  "progress.elapsed": Style(color="yellow"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:135** - Possível acesso a relação em serialização
  ```python
  "progress.percentage": Style(color="magenta"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:136** - Possível acesso a relação em serialização
  ```python
  "progress.remaining": Style(color="cyan"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:138** - Possível acesso a relação em serialização
  ```python
  "progress.spinner": Style(color="green"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:139** - Possível acesso a relação em serialização
  ```python
  "status.spinner": Style(color="green"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:141** - Possível acesso a relação em serialização
  ```python
  "tree.line": Style(),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:142** - Possível acesso a relação em serialização
  ```python
  "markdown.paragraph": Style(),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:143** - Possível acesso a relação em serialização
  ```python
  "markdown.text": Style(),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:144** - Possível acesso a relação em serialização
  ```python
  "markdown.em": Style(italic=True),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:145** - Possível acesso a relação em serialização
  ```python
  "markdown.emph": Style(italic=True),  # For commonmark backwards compatibility
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:146** - Possível acesso a relação em serialização
  ```python
  "markdown.strong": Style(bold=True),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:147** - Possível acesso a relação em serialização
  ```python
  "markdown.code": Style(bold=True, color="cyan", bgcolor="black"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:148** - Possível acesso a relação em serialização
  ```python
  "markdown.code_block": Style(color="cyan", bgcolor="black"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:149** - Possível acesso a relação em serialização
  ```python
  "markdown.block_quote": Style(color="magenta"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:150** - Possível acesso a relação em serialização
  ```python
  "markdown.list": Style(color="cyan"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:151** - Possível acesso a relação em serialização
  ```python
  "markdown.item": Style(),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:154** - Possível acesso a relação em serialização
  ```python
  "markdown.hr": Style(color="yellow"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:156** - Possível acesso a relação em serialização
  ```python
  "markdown.h1": Style(bold=True),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:157** - Possível acesso a relação em serialização
  ```python
  "markdown.h2": Style(bold=True, underline=True),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:158** - Possível acesso a relação em serialização
  ```python
  "markdown.h3": Style(bold=True),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:159** - Possível acesso a relação em serialização
  ```python
  "markdown.h4": Style(bold=True, dim=True),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:160** - Possível acesso a relação em serialização
  ```python
  "markdown.h5": Style(underline=True),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:161** - Possível acesso a relação em serialização
  ```python
  "markdown.h6": Style(italic=True),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:162** - Possível acesso a relação em serialização
  ```python
  "markdown.h7": Style(italic=True, dim=True),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:163** - Possível acesso a relação em serialização
  ```python
  "markdown.link": Style(color="bright_blue"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:164** - Possível acesso a relação em serialização
  ```python
  "markdown.link_url": Style(color="blue", underline=True),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:165** - Possível acesso a relação em serialização
  ```python
  "markdown.s": Style(strike=True),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:166** - Possível acesso a relação em serialização
  ```python
  "iso8601.date": Style(color="blue"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:167** - Possível acesso a relação em serialização
  ```python
  "iso8601.time": Style(color="magenta"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/default_styles.py:168** - Possível acesso a relação em serialização
  ```python
  "iso8601.timezone": Style(color="yellow"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/_log_render.py:49** - Possível acesso a relação em serialização
  ```python
  output.add_column(style="log.time")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/_log_render.py:51** - Possível acesso a relação em serialização
  ```python
  output.add_column(style="log.level", width=self.level_width)
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/_log_render.py:52** - Possível acesso a relação em serialização
  ```python
  output.add_column(ratio=1, style="log.message", overflow="fold")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/_log_render.py:54** - Possível acesso a relação em serialização
  ```python
  output.add_column(style="log.path")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/layout.py:191** - Acesso a atributo de relação em loop
  ```python
  return [child for child in self._children if child.visible]
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/containers.py:51** - Acesso a atributo de relação em loop
  ```python
  for renderable in self._renderables
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/traceback.py:182** - Loop com query de relação
  ```python
  for _ in range(tb_offset):
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/traceback.py:182** - Acesso a atributo de relação em loop
  ```python
  for _ in range(tb_offset):
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/traceback.py:598** - Possível acesso a relação em serialização
  ```python
  "pygments.text": token_style(Token),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/traceback.py:599** - Possível acesso a relação em serialização
  ```python
  "pygments.string": token_style(String),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/traceback.py:600** - Possível acesso a relação em serialização
  ```python
  "pygments.function": token_style(Name.Function),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/traceback.py:601** - Possível acesso a relação em serialização
  ```python
  "pygments.number": token_style(Number),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/traceback.py:602** - Possível acesso a relação em serialização
  ```python
  "repr.indent": token_style(Comment) + Style(dim=True),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/traceback.py:603** - Possível acesso a relação em serialização
  ```python
  "repr.str": token_style(String),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/traceback.py:604** - Possível acesso a relação em serialização
  ```python
  "repr.brace": token_style(TextToken) + Style(bold=True),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/traceback.py:605** - Possível acesso a relação em serialização
  ```python
  "repr.number": token_style(Number),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/traceback.py:606** - Possível acesso a relação em serialização
  ```python
  "repr.bool_true": token_style(Keyword.Constant),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/traceback.py:607** - Possível acesso a relação em serialização
  ```python
  "repr.bool_false": token_style(Keyword.Constant),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/traceback.py:608** - Possível acesso a relação em serialização
  ```python
  "repr.none": token_style(Keyword.Constant),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/traceback.py:609** - Possível acesso a relação em serialização
  ```python
  "scope.border": token_style(String.Delimiter),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/traceback.py:610** - Possível acesso a relação em serialização
  ```python
  "scope.equals": token_style(Operator),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/traceback.py:611** - Possível acesso a relação em serialização
  ```python
  "scope.key": token_style(Name),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/traceback.py:626** - Possível acesso a relação em serialização
  ```python
  border_style="traceback.border",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/traceback.py:648** - Possível acesso a relação em serialização
  ```python
  (f"{stack.exc_type}: ", "traceback.exc_type"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/traceback.py:653** - Possível acesso a relação em serialização
  ```python
  (f"{stack.exc_type}: ", "traceback.exc_type"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/traceback.py:657** - Possível acesso a relação em serialização
  ```python
  yield Text.assemble((f"{stack.exc_type}", "traceback.exc_type"))
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/traceback.py:660** - Possível acesso a relação em serialização
  ```python
  yield Text.assemble(("[NOTE] ", "traceback.note"), highlighter(note))
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/traceback.py:697** - Possível acesso a relação em serialização
  ```python
  (f" {syntax_error.filename}", "pygments.string"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/traceback.py:698** - Possível acesso a relação em serialização
  ```python
  (":", "pygments.text"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/traceback.py:699** - Possível acesso a relação em serialização
  ```python
  (str(syntax_error.lineno), "pygments.number"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/traceback.py:700** - Possível acesso a relação em serialização
  ```python
  style="pygments.text",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/traceback.py:709** - Possível acesso a relação em serialização
  ```python
  style="pygments.text",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/traceback.py:762** - Possível acesso a relação em serialização
  ```python
  style="traceback.error",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/traceback.py:772** - Possível acesso a relação em serialização
  ```python
  path_highlighter(Text(frame.filename, style="pygments.string")),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/traceback.py:773** - Possível acesso a relação em serialização
  ```python
  (":", "pygments.text"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/traceback.py:774** - Possível acesso a relação em serialização
  ```python
  (str(frame.lineno), "pygments.number"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/traceback.py:776** - Possível acesso a relação em serialização
  ```python
  (frame.name, "pygments.function"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/traceback.py:777** - Possível acesso a relação em serialização
  ```python
  style="pygments.text",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/traceback.py:782** - Possível acesso a relação em serialização
  ```python
  (frame.name, "pygments.function"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/traceback.py:783** - Possível acesso a relação em serialização
  ```python
  (":", "pygments.text"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/traceback.py:784** - Possível acesso a relação em serialização
  ```python
  (str(frame.lineno), "pygments.number"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/traceback.py:785** - Possível acesso a relação em serialização
  ```python
  style="pygments.text",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/traceback.py:820** - Possível acesso a relação em serialização
  ```python
  (f"\n{error}", "traceback.error"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/traceback.py:841** - Possível acesso a relação em serialização
  ```python
  style="traceback.error_range",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/control.py:23** - Acesso a atributo de relação em loop
  ```python
  _codepoint: None for _codepoint in STRIP_CONTROL_CODES
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/filesize.py:79** - Possível acesso a relação em serialização
  ```python
  '30.00kB'
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/file_proxy.py:45** - Acesso a atributo de relação em loop
  ```python
  self.__ansi_decoder.decode_line(line) for line in lines
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/markup.py:83** - Acesso a atributo de relação em loop
  ```python
  for match in RE_TAGS.finditer(markup):
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/repr.py:49** - Acesso a atributo de relação em loop
  ```python
  for arg in self.__rich_repr__():  # type: ignore[attr-defined]
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/pretty.py:352** - Acesso a atributo de relação em loop
  ```python
  max(cell_len(line) for line in pretty_str.splitlines()) if pretty_str else 0
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/pretty.py:333** - Possível acesso a relação em serialização
  ```python
  self.indent_size, style="repr.indent"
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/rule.py:18** - Possível acesso a relação em serialização
  ```python
  style (StyleType, optional): Style of Rule. Defaults to "rule.line".
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/rule.py:28** - Possível acesso a relação em serialização
  ```python
  style: Union[str, Style] = "rule.line",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/rule.py:68** - Possível acesso a relação em serialização
  ```python
  title_text = console.render_str(self.title, style="rule.text")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/_inspect.py:139** - Acesso a atributo de relação em loop
  ```python
  keys = [key for key in keys if not key.startswith("__")]
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/_inspect.py:78** - Possível acesso a relação em serialização
  ```python
  border_style="scope.border",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/_inspect.py:98** - Possível acesso a relação em serialização
  ```python
  callable_name = Text(name, style="inspect.callable")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/_inspect.py:115** - Possível acesso a relação em serialização
  ```python
  (qualname, "inspect.callable"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/_inspect.py:161** - Possível acesso a relação em serialização
  ```python
  doc_text = Text(_doc, style="inspect.help")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/_inspect.py:177** - Possível acesso a relação em serialização
  ```python
  "inspect.attr.dunder" if key.startswith("__") else "inspect.attr",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/_inspect.py:179** - Possível acesso a relação em serialização
  ```python
  (" =", "inspect.equals"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/_inspect.py:183** - Possível acesso a relação em serialização
  ```python
  warning.stylize("inspect.error")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/_inspect.py:200** - Possível acesso a relação em serialização
  ```python
  doc.stylize("inspect.doc")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/_inspect.py:250** - Possível acesso a relação em serialização
  ```python
  `object_types_mro_as_strings(JSONDecoder)` will return `['json.decoder.JSONDecoder', 'builtins.object']`
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/text.py:243** - Acesso a atributo de relação em loop
  ```python
  *((span.start, False, span.style) for span in self._spans),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/highlighter.py:76** - Acesso a atributo de relação em loop
  ```python
  for re_highlight in self.highlights:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/highlighter.py:137** - Possível acesso a relação em serialização
  ```python
  append(Span(start, end, "json.key"))
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/syntax.py:619** - Acesso a atributo de relação em loop
  ```python
  + (max(cell_len(line) for line in lines) if lines else 0)
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/table.py:246** - Acesso a atributo de relação em loop
  ```python
  for header in headers:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/table.py:60** - Possível acesso a relação em serialização
  ```python
  header_style (Union[str, Style], optional): Style of the header. Defaults to "table.header".
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/table.py:61** - Possível acesso a relação em serialização
  ```python
  footer_style (Union[str, Style], optional): Style of the footer. Defaults to "table.footer".
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/table.py:176** - Possível acesso a relação em serialização
  ```python
  header_style (Union[str, Style], optional): Style of the header. Defaults to "table.header".
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/table.py:177** - Possível acesso a relação em serialização
  ```python
  footer_style (Union[str, Style], optional): Style of the footer. Defaults to "table.footer".
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/table.py:209** - Possível acesso a relação em serialização
  ```python
  header_style: Optional[StyleType] = "table.header",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/table.py:210** - Possível acesso a relação em serialização
  ```python
  footer_style: Optional[StyleType] = "table.footer",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/table.py:512** - Possível acesso a relação em serialização
  ```python
  style=Style.pick_first(self.title_style, "table.title"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/table.py:519** - Possível acesso a relação em serialização
  ```python
  style=Style.pick_first(self.caption_style, "table.caption"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/progress_bar.py:109** - Acesso a atributo de relação em loop
  ```python
  for index in range(PULSE_SIZE):
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/progress_bar.py:26** - Possível acesso a relação em serialização
  ```python
  style (StyleType, optional): Style for the bar background. Defaults to "bar.back".
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/progress_bar.py:27** - Possível acesso a relação em serialização
  ```python
  complete_style (StyleType, optional): Style for the completed bar. Defaults to "bar.complete".
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/progress_bar.py:28** - Possível acesso a relação em serialização
  ```python
  finished_style (StyleType, optional): Style for a finished bar. Defaults to "bar.finished".
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/progress_bar.py:29** - Possível acesso a relação em serialização
  ```python
  pulse_style (StyleType, optional): Style for pulsing bars. Defaults to "bar.pulse".
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/progress_bar.py:39** - Possível acesso a relação em serialização
  ```python
  style: StyleType = "bar.back",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/progress_bar.py:40** - Possível acesso a relação em serialização
  ```python
  complete_style: StyleType = "bar.complete",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/progress_bar.py:41** - Possível acesso a relação em serialização
  ```python
  finished_style: StyleType = "bar.finished",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/progress_bar.py:42** - Possível acesso a relação em serialização
  ```python
  pulse_style: StyleType = "bar.pulse",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/prompt.py:225** - Acesso a atributo de relação em loop
  ```python
  return value.strip().lower() in [choice.lower() for choice in self.choices]
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/prompt.py:160** - Possível acesso a relação em serialização
  ```python
  return Text(f"({default})", "prompt.default")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/prompt.py:178** - Possível acesso a relação em serialização
  ```python
  prompt.append(choices, "prompt.choices")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/prompt.py:356** - Possível acesso a relação em serialização
  ```python
  return Text(f"({yes})" if default else f"({no})", style="prompt.default")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/segment.py:262** - Acesso a atributo de relação em loop
  ```python
  for segment in segments:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/segment.py:735** - Possível acesso a relação em serialização
  ```python
  console.rule("rich.Segment")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/ansi.py:41** - Acesso a atributo de relação em loop
  ```python
  for match in re_ansi.finditer(ansi_text):
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/ansi.py:241** - Possível acesso a relação em serialização
  ```python
  console.save_html("stdout.html")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/progress.py:1038** - Acesso a atributo de relação em loop
  ```python
  total_completed = sum(sample.completed for sample in iter_progress)
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/progress.py:118** - Possível acesso a relação em serialização
  ```python
  style: StyleType = "bar.back",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/progress.py:119** - Possível acesso a relação em serialização
  ```python
  complete_style: StyleType = "bar.complete",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/progress.py:120** - Possível acesso a relação em serialização
  ```python
  finished_style: StyleType = "bar.finished",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/progress.py:121** - Possível acesso a relação em serialização
  ```python
  pulse_style: StyleType = "bar.pulse",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/progress.py:137** - Possível acesso a relação em serialização
  ```python
  style (StyleType, optional): Style for the bar background. Defaults to "bar.back".
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/progress.py:138** - Possível acesso a relação em serialização
  ```python
  complete_style (StyleType, optional): Style for the completed bar. Defaults to "bar.complete".
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/progress.py:139** - Possível acesso a relação em serialização
  ```python
  finished_style (StyleType, optional): Style for a finished bar. Defaults to "bar.finished".
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/progress.py:140** - Possível acesso a relação em serialização
  ```python
  pulse_style (StyleType, optional): Style for pulsing bars. Defaults to "bar.pulse".
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/progress.py:318** - Possível acesso a relação em serialização
  ```python
  style: StyleType = "bar.back",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/progress.py:319** - Possível acesso a relação em serialização
  ```python
  complete_style: StyleType = "bar.complete",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/progress.py:320** - Possível acesso a relação em serialização
  ```python
  finished_style: StyleType = "bar.finished",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/progress.py:321** - Possível acesso a relação em serialização
  ```python
  pulse_style: StyleType = "bar.pulse",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/progress.py:334** - Possível acesso a relação em serialização
  ```python
  style (StyleType, optional): Style for the bar background. Defaults to "bar.back".
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/progress.py:335** - Possível acesso a relação em serialização
  ```python
  complete_style (StyleType, optional): Style for the completed bar. Defaults to "bar.complete".
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/progress.py:336** - Possível acesso a relação em serialização
  ```python
  finished_style (StyleType, optional): Style for a finished bar. Defaults to "bar.finished".
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/progress.py:337** - Possível acesso a relação em serialização
  ```python
  pulse_style (StyleType, optional): Style for pulsing bars. Defaults to "bar.pulse".
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/progress.py:389** - Possível acesso a relação em serialização
  ```python
  style: StyleType = "bar.back",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/progress.py:390** - Possível acesso a relação em serialização
  ```python
  complete_style: StyleType = "bar.complete",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/progress.py:391** - Possível acesso a relação em serialização
  ```python
  finished_style: StyleType = "bar.finished",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/progress.py:392** - Possível acesso a relação em serialização
  ```python
  pulse_style: StyleType = "bar.pulse",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/progress.py:414** - Possível acesso a relação em serialização
  ```python
  style: StyleType = "bar.back",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/progress.py:415** - Possível acesso a relação em serialização
  ```python
  complete_style: StyleType = "bar.complete",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/progress.py:416** - Possível acesso a relação em serialização
  ```python
  finished_style: StyleType = "bar.finished",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/progress.py:417** - Possível acesso a relação em serialização
  ```python
  pulse_style: StyleType = "bar.pulse",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/progress.py:438** - Possível acesso a relação em serialização
  ```python
  style: StyleType = "bar.back",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/progress.py:439** - Possível acesso a relação em serialização
  ```python
  complete_style: StyleType = "bar.complete",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/progress.py:440** - Possível acesso a relação em serialização
  ```python
  finished_style: StyleType = "bar.finished",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/progress.py:441** - Possível acesso a relação em serialização
  ```python
  pulse_style: StyleType = "bar.pulse",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/progress.py:459** - Possível acesso a relação em serialização
  ```python
  style (StyleType, optional): Style for the bar background. Defaults to "bar.back".
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/progress.py:460** - Possível acesso a relação em serialização
  ```python
  complete_style (StyleType, optional): Style for the completed bar. Defaults to "bar.complete".
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/progress.py:461** - Possível acesso a relação em serialização
  ```python
  finished_style (StyleType, optional): Style for a finished bar. Defaults to "bar.finished".
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/progress.py:462** - Possível acesso a relação em serialização
  ```python
  pulse_style (StyleType, optional): Style for pulsing bars. Defaults to "bar.pulse".
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/progress.py:573** - Possível acesso a relação em serialização
  ```python
  style (StyleType, optional): Style of spinner. Defaults to "progress.spinner".
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/progress.py:581** - Possível acesso a relação em serialização
  ```python
  style: Optional[StyleType] = "progress.spinner",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/progress.py:597** - Possível acesso a relação em serialização
  ```python
  spinner_style: Optional[StyleType] = "progress.spinner",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/progress.py:604** - Possível acesso a relação em serialização
  ```python
  spinner_style (Optional[StyleType], optional): Spinner style. Defaults to "progress.spinner".
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/progress.py:653** - Possível acesso a relação em serialização
  ```python
  style (StyleType, optional): Style for the bar background. Defaults to "bar.back".
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/progress.py:654** - Possível acesso a relação em serialização
  ```python
  complete_style (StyleType, optional): Style for the completed bar. Defaults to "bar.complete".
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/progress.py:655** - Possível acesso a relação em serialização
  ```python
  finished_style (StyleType, optional): Style for a finished bar. Defaults to "bar.finished".
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/progress.py:656** - Possível acesso a relação em serialização
  ```python
  pulse_style (StyleType, optional): Style for pulsing bars. Defaults to "bar.pulse".
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/progress.py:662** - Possível acesso a relação em serialização
  ```python
  style: StyleType = "bar.back",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/progress.py:663** - Possível acesso a relação em serialização
  ```python
  complete_style: StyleType = "bar.complete",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/progress.py:664** - Possível acesso a relação em serialização
  ```python
  finished_style: StyleType = "bar.finished",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/progress.py:665** - Possível acesso a relação em serialização
  ```python
  pulse_style: StyleType = "bar.pulse",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/progress.py:697** - Possível acesso a relação em serialização
  ```python
  return Text("-:--:--", style="progress.elapsed")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/progress.py:699** - Possível acesso a relação em serialização
  ```python
  return Text(str(delta), style="progress.elapsed")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/progress.py:749** - Possível acesso a relação em serialização
  ```python
  return Text("", style="progress.percentage")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/progress.py:756** - Possível acesso a relação em serialização
  ```python
  return Text(f"{data_speed:.1f}{suffix} it/s", style="progress.percentage")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/progress.py:799** - Possível acesso a relação em serialização
  ```python
  style = "progress.elapsed"
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/progress.py:802** - Possível acesso a relação em serialização
  ```python
  style = "progress.remaining"
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/progress.py:828** - Possível acesso a relação em serialização
  ```python
  return Text(data_size, style="progress.filesize")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/progress.py:863** - Possível acesso a relação em serialização
  ```python
  style="progress.download",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/progress.py:912** - Possível acesso a relação em serialização
  ```python
  download_text = Text(download_status, style="progress.download")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/panel.py:311** - Possível acesso a relação em serialização
  ```python
  title="rich.Panel",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/padding.py:113** - Acesso a atributo de relação em loop
  ```python
  for line in lines:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/__main__.py:22** - Acesso a atributo de relação em loop
  ```python
  for y in range(0, 5):
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/scope.py:49** - Possível acesso a relação em serialização
  ```python
  (key, "scope.key.special" if key.startswith("__") else "scope.key"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/scope.py:50** - Possível acesso a relação em serialização
  ```python
  (" =", "scope.equals"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/scope.py:65** - Possível acesso a relação em serialização
  ```python
  border_style="scope.border",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/scope.py:78** - Possível acesso a relação em serialização
  ```python
  "version": "1.1",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/status.py:18** - Possível acesso a relação em serialização
  ```python
  spinner_style (StyleType, optional): Style of spinner. Defaults to "status.spinner".
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/rich/status.py:29** - Possível acesso a relação em serialização
  ```python
  spinner_style: StyleType = "status.spinner",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/tomli_w/_writer.py:13** - Acesso a atributo de relação em loop
  ```python
  ASCII_CTRL = frozenset(chr(i) for i in range(32)) | frozenset(chr(127))
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/filepost.py:38** - Acesso a atributo de relação em loop
  ```python
  for field in i:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/fields.py:43** - Loop com query de relação
  ```python
  if not any(ch in value for ch in '"\\\r\n'):
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/fields.py:43** - Acesso a atributo de relação em loop
  ```python
  if not any(ch in value for ch in '"\\\r\n'):
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/fields.py:170** - Possível acesso a relação em serialização
  ```python
  'fakefile': ('foofile.txt', 'contents of foofile'),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/fields.py:171** - Possível acesso a relação em serialização
  ```python
  'realfile': ('barfile.txt', open('realfile').read()),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/fields.py:172** - Possível acesso a relação em serialização
  ```python
  'typedfile': ('bazfile.bin', open('bazfile').read(), 'image/jpeg'),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/request.py:131** - Possível acesso a relação em serialização
  ```python
  'fakefile': ('foofile.txt', 'contents of foofile'),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/request.py:132** - Possível acesso a relação em serialização
  ```python
  'realfile': ('barfile.txt', open('realfile').read()),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/request.py:133** - Possível acesso a relação em serialização
  ```python
  'typedfile': ('bazfile.bin', open('bazfile').read(),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/poolmanager.py:105** - Loop com query de relação
  ```python
  for key in ("headers", "_proxy_headers", "_socks_options"):
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/poolmanager.py:105** - Acesso a atributo de relação em loop
  ```python
  for key in ("headers", "_proxy_headers", "_socks_options"):
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/response.py:133** - Loop com query de relação
  ```python
  self._decoders = [_get_decoder(m.strip()) for m in modes.split(",")]
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/response.py:133** - Acesso a atributo de relação em loop
  ```python
  self._decoders = [_get_decoder(m.strip()) for m in modes.split(",")]
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/connection.py:223** - Acesso a atributo de relação em loop
  ```python
  if not any(isinstance(v, str) and v == SKIP_HEADER for v in values):
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/connection.py:439** - Possível acesso a relação em serialização
  ```python
  and self.sock.version() in {"TLSv1", "TLSv1.1"}
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/_collections.py:99** - Acesso a atributo de relação em loop
  ```python
  for value in values:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/connectionpool.py:214** - Loop com query de relação
  ```python
  for _ in xrange(maxsize):
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/connectionpool.py:214** - Acesso a atributo de relação em loop
  ```python
  for _ in xrange(maxsize):
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/util/ssltransport.py:26** - Acesso a atributo de relação em loop
  ```python
  for TLS in TLS.
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/util/response.py:84** - Acesso a atributo de relação em loop
  ```python
  for defect in defects
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/util/retry.py:303** - Loop com query de relação
  ```python
  [h.lower() for h in remove_headers_on_redirect]
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/util/retry.py:303** - Acesso a atributo de relação em loop
  ```python
  [h.lower() for h in remove_headers_on_redirect]
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/util/retry.py:39** - Possível acesso a relação em serialização
  ```python
  "Using 'Retry.DEFAULT_METHOD_WHITELIST' is deprecated and "
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/util/retry.py:40** - Possível acesso a relação em serialização
  ```python
  "will be removed in v2.0. Use 'Retry.DEFAULT_ALLOWED_METHODS' instead",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/util/retry.py:48** - Possível acesso a relação em serialização
  ```python
  "Using 'Retry.DEFAULT_METHOD_WHITELIST' is deprecated and "
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/util/retry.py:49** - Possível acesso a relação em serialização
  ```python
  "will be removed in v2.0. Use 'Retry.DEFAULT_ALLOWED_METHODS' instead",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/util/retry.py:57** - Possível acesso a relação em serialização
  ```python
  "Using 'Retry.DEFAULT_REDIRECT_HEADERS_BLACKLIST' is deprecated and "
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/util/retry.py:58** - Possível acesso a relação em serialização
  ```python
  "will be removed in v2.0. Use 'Retry.DEFAULT_REMOVE_HEADERS_ON_REDIRECT' instead",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/util/retry.py:66** - Possível acesso a relação em serialização
  ```python
  "Using 'Retry.DEFAULT_REDIRECT_HEADERS_BLACKLIST' is deprecated and "
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/util/retry.py:67** - Possível acesso a relação em serialização
  ```python
  "will be removed in v2.0. Use 'Retry.DEFAULT_REMOVE_HEADERS_ON_REDIRECT' instead",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/util/retry.py:75** - Possível acesso a relação em serialização
  ```python
  "Using 'Retry.BACKOFF_MAX' is deprecated and "
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/util/retry.py:76** - Possível acesso a relação em serialização
  ```python
  "will be removed in v2.0. Use 'Retry.DEFAULT_BACKOFF_MAX' instead",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/util/retry.py:84** - Possível acesso a relação em serialização
  ```python
  "Using 'Retry.BACKOFF_MAX' is deprecated and "
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/util/retry.py:85** - Possível acesso a relação em serialização
  ```python
  "will be removed in v2.0. Use 'Retry.DEFAULT_BACKOFF_MAX' instead",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/util/url.py:54** - Acesso a atributo de relação em loop
  ```python
  IPV6_PAT = "(?:" + "|".join([x % _subs for x in _variations]) + ")"
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/util/url.py:146** - Possível acesso a relação em serialização
  ```python
  >>> Url('http', 'username:password', 'host.com', 80,
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/util/url.py:349** - Possível acesso a relação em serialização
  ```python
  Url(scheme='http', host='google.com', port=None, path='/mail/', ...)
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/util/url.py:351** - Possível acesso a relação em serialização
  ```python
  Url(scheme=None, host='google.com', port=80, path=None, ...)
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/util/connection.py:72** - Acesso a atributo de relação em loop
  ```python
  for res in socket.getaddrinfo(host, port, family, socket.SOCK_STREAM):
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/util/ssl_match_hostname.py:72** - Acesso a atributo de relação em loop
  ```python
  for frag in remainder:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/contrib/securetransport.py:744** - Possível acesso a relação em serialização
  ```python
  return "TLSv1.2"
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/contrib/securetransport.py:746** - Possível acesso a relação em serialização
  ```python
  return "TLSv1.1"
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/contrib/pyopenssl.py:203** - Acesso a atributo de relação em loop
  ```python
  for prefix in [u"*.", u"."]:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/contrib/_securetransport/low_level.py:44** - Acesso a atributo de relação em loop
  ```python
  keys = (t[0] for t in tuples)
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/contrib/_securetransport/low_level.py:381** - Possível acesso a relação em serialização
  ```python
  "TLSv1.1": (3, 2),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/contrib/_securetransport/low_level.py:382** - Possível acesso a relação em serialização
  ```python
  "TLSv1.2": (3, 3),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:134** - Acesso a atributo de relação em loop
  ```python
  attrs += [attr.name for attr in self._moved_attributes]
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:282** - Possível acesso a relação em serialização
  ```python
  "collections.abc" if sys.version_info >= (3, 3) else "collections",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:285** - Possível acesso a relação em serialização
  ```python
  MovedModule("dbm_gnu", "gdbm", "dbm.gnu"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:286** - Possível acesso a relação em serialização
  ```python
  MovedModule("dbm_ndbm", "dbm", "dbm.ndbm"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:292** - Possível acesso a relação em serialização
  ```python
  MovedModule("http_cookiejar", "cookielib", "http.cookiejar"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:293** - Possível acesso a relação em serialização
  ```python
  MovedModule("http_cookies", "Cookie", "http.cookies"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:294** - Possível acesso a relação em serialização
  ```python
  MovedModule("html_entities", "htmlentitydefs", "html.entities"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:295** - Possível acesso a relação em serialização
  ```python
  MovedModule("html_parser", "HTMLParser", "html.parser"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:296** - Possível acesso a relação em serialização
  ```python
  MovedModule("http_client", "httplib", "http.client"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:297** - Possível acesso a relação em serialização
  ```python
  MovedModule("email_mime_base", "email.MIMEBase", "email.mime.base"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:298** - Possível acesso a relação em serialização
  ```python
  MovedModule("email_mime_image", "email.MIMEImage", "email.mime.image"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:299** - Possível acesso a relação em serialização
  ```python
  MovedModule("email_mime_multipart", "email.MIMEMultipart", "email.mime.multipart"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:301** - Possível acesso a relação em serialização
  ```python
  "email_mime_nonmultipart", "email.MIMENonMultipart", "email.mime.nonmultipart"
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:303** - Possível acesso a relação em serialização
  ```python
  MovedModule("email_mime_text", "email.MIMEText", "email.mime.text"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:304** - Possível acesso a relação em serialização
  ```python
  MovedModule("BaseHTTPServer", "BaseHTTPServer", "http.server"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:305** - Possível acesso a relação em serialização
  ```python
  MovedModule("CGIHTTPServer", "CGIHTTPServer", "http.server"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:306** - Possível acesso a relação em serialização
  ```python
  MovedModule("SimpleHTTPServer", "SimpleHTTPServer", "http.server"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:313** - Possível acesso a relação em serialização
  ```python
  MovedModule("tkinter_dialog", "Dialog", "tkinter.dialog"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:314** - Possível acesso a relação em serialização
  ```python
  MovedModule("tkinter_filedialog", "FileDialog", "tkinter.filedialog"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:315** - Possível acesso a relação em serialização
  ```python
  MovedModule("tkinter_scrolledtext", "ScrolledText", "tkinter.scrolledtext"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:316** - Possível acesso a relação em serialização
  ```python
  MovedModule("tkinter_simpledialog", "SimpleDialog", "tkinter.simpledialog"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:317** - Possível acesso a relação em serialização
  ```python
  MovedModule("tkinter_tix", "Tix", "tkinter.tix"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:318** - Possível acesso a relação em serialização
  ```python
  MovedModule("tkinter_ttk", "ttk", "tkinter.ttk"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:319** - Possível acesso a relação em serialização
  ```python
  MovedModule("tkinter_constants", "Tkconstants", "tkinter.constants"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:320** - Possível acesso a relação em serialização
  ```python
  MovedModule("tkinter_dnd", "Tkdnd", "tkinter.dnd"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:321** - Possível acesso a relação em serialização
  ```python
  MovedModule("tkinter_colorchooser", "tkColorChooser", "tkinter.colorchooser"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:322** - Possível acesso a relação em serialização
  ```python
  MovedModule("tkinter_commondialog", "tkCommonDialog", "tkinter.commondialog"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:323** - Possível acesso a relação em serialização
  ```python
  MovedModule("tkinter_tkfiledialog", "tkFileDialog", "tkinter.filedialog"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:324** - Possível acesso a relação em serialização
  ```python
  MovedModule("tkinter_font", "tkFont", "tkinter.font"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:325** - Possível acesso a relação em serialização
  ```python
  MovedModule("tkinter_messagebox", "tkMessageBox", "tkinter.messagebox"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:326** - Possível acesso a relação em serialização
  ```python
  MovedModule("tkinter_tksimpledialog", "tkSimpleDialog", "tkinter.simpledialog"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:327** - Possível acesso a relação em serialização
  ```python
  MovedModule("urllib_parse", __name__ + ".moves.urllib_parse", "urllib.parse"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:328** - Possível acesso a relação em serialização
  ```python
  MovedModule("urllib_error", __name__ + ".moves.urllib_error", "urllib.error"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:330** - Possível acesso a relação em serialização
  ```python
  MovedModule("urllib_robotparser", "robotparser", "urllib.robotparser"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:331** - Possível acesso a relação em serialização
  ```python
  MovedModule("xmlrpc_client", "xmlrpclib", "xmlrpc.client"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:332** - Possível acesso a relação em serialização
  ```python
  MovedModule("xmlrpc_server", "SimpleXMLRPCServer", "xmlrpc.server"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:358** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("ParseResult", "urlparse", "urllib.parse"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:359** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("SplitResult", "urlparse", "urllib.parse"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:360** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("parse_qs", "urlparse", "urllib.parse"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:361** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("parse_qsl", "urlparse", "urllib.parse"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:362** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("urldefrag", "urlparse", "urllib.parse"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:363** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("urljoin", "urlparse", "urllib.parse"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:364** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("urlparse", "urlparse", "urllib.parse"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:365** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("urlsplit", "urlparse", "urllib.parse"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:366** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("urlunparse", "urlparse", "urllib.parse"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:367** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("urlunsplit", "urlparse", "urllib.parse"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:368** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("quote", "urllib", "urllib.parse"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:369** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("quote_plus", "urllib", "urllib.parse"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:370** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("unquote", "urllib", "urllib.parse"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:371** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("unquote_plus", "urllib", "urllib.parse"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:373** - Possível acesso a relação em serialização
  ```python
  "unquote_to_bytes", "urllib", "urllib.parse", "unquote", "unquote_to_bytes"
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:375** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("urlencode", "urllib", "urllib.parse"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:376** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("splitquery", "urllib", "urllib.parse"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:377** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("splittag", "urllib", "urllib.parse"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:378** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("splituser", "urllib", "urllib.parse"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:379** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("splitvalue", "urllib", "urllib.parse"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:380** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("uses_fragment", "urlparse", "urllib.parse"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:381** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("uses_netloc", "urlparse", "urllib.parse"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:382** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("uses_params", "urlparse", "urllib.parse"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:383** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("uses_query", "urlparse", "urllib.parse"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:384** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("uses_relative", "urlparse", "urllib.parse"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:394** - Possível acesso a relação em serialização
  ```python
  "moves.urllib_parse",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:405** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("URLError", "urllib2", "urllib.error"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:406** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("HTTPError", "urllib2", "urllib.error"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:407** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("ContentTooShortError", "urllib", "urllib.error"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:417** - Possível acesso a relação em serialização
  ```python
  "moves.urllib_error",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:428** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("urlopen", "urllib2", "urllib.request"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:429** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("install_opener", "urllib2", "urllib.request"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:430** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("build_opener", "urllib2", "urllib.request"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:431** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("pathname2url", "urllib", "urllib.request"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:432** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("url2pathname", "urllib", "urllib.request"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:433** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("getproxies", "urllib", "urllib.request"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:434** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("Request", "urllib2", "urllib.request"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:435** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("OpenerDirector", "urllib2", "urllib.request"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:436** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("HTTPDefaultErrorHandler", "urllib2", "urllib.request"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:437** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("HTTPRedirectHandler", "urllib2", "urllib.request"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:438** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("HTTPCookieProcessor", "urllib2", "urllib.request"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:439** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("ProxyHandler", "urllib2", "urllib.request"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:440** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("BaseHandler", "urllib2", "urllib.request"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:441** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("HTTPPasswordMgr", "urllib2", "urllib.request"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:442** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("HTTPPasswordMgrWithDefaultRealm", "urllib2", "urllib.request"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:443** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("AbstractBasicAuthHandler", "urllib2", "urllib.request"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:444** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("HTTPBasicAuthHandler", "urllib2", "urllib.request"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:445** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("ProxyBasicAuthHandler", "urllib2", "urllib.request"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:446** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("AbstractDigestAuthHandler", "urllib2", "urllib.request"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:447** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("HTTPDigestAuthHandler", "urllib2", "urllib.request"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:448** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("ProxyDigestAuthHandler", "urllib2", "urllib.request"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:449** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("HTTPHandler", "urllib2", "urllib.request"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:450** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("HTTPSHandler", "urllib2", "urllib.request"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:451** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("FileHandler", "urllib2", "urllib.request"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:452** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("FTPHandler", "urllib2", "urllib.request"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:453** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("CacheFTPHandler", "urllib2", "urllib.request"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:454** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("UnknownHandler", "urllib2", "urllib.request"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:455** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("HTTPErrorProcessor", "urllib2", "urllib.request"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:456** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("urlretrieve", "urllib", "urllib.request"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:457** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("urlcleanup", "urllib", "urllib.request"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:458** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("URLopener", "urllib", "urllib.request"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:459** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("FancyURLopener", "urllib", "urllib.request"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:460** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("proxy_bypass", "urllib", "urllib.request"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:461** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("parse_http_list", "urllib2", "urllib.request"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:462** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("parse_keqv_list", "urllib2", "urllib.request"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:472** - Possível acesso a relação em serialização
  ```python
  "moves.urllib_request",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:483** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("addbase", "urllib", "urllib.response"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:484** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("addclosehook", "urllib", "urllib.response"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:485** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("addinfo", "urllib", "urllib.response"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:486** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("addinfourl", "urllib", "urllib.response"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:496** - Possível acesso a relação em serialização
  ```python
  "moves.urllib_response",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:507** - Possível acesso a relação em serialização
  ```python
  MovedAttribute("RobotFileParser", "robotparser", "urllib.robotparser"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:519** - Possível acesso a relação em serialização
  ```python
  "moves.urllib_robotparser",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:529** - Possível acesso a relação em serialização
  ```python
  parse = _importer._get_module("moves.urllib_parse")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:530** - Possível acesso a relação em serialização
  ```python
  error = _importer._get_module("moves.urllib_error")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:531** - Possível acesso a relação em serialização
  ```python
  request = _importer._get_module("moves.urllib_request")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:532** - Possível acesso a relação em serialização
  ```python
  response = _importer._get_module("moves.urllib_response")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:533** - Possível acesso a relação em serialização
  ```python
  robotparser = _importer._get_module("moves.urllib_robotparser")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/urllib3/packages/six.py:540** - Possível acesso a relação em serialização
  ```python
  Module_six_moves_urllib(__name__ + ".moves.urllib"), "moves.urllib"
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pkg_resources/__init__.py:639** - Loop com query de relação
  ```python
  for entry in entries:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pkg_resources/__init__.py:639** - Acesso a atributo de relação em loop
  ```python
  for entry in entries:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pkg_resources/__init__.py:509** - Possível acesso a relação em serialização
  ```python
  and macosversion >= "10.3"
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pkg_resources/__init__.py:511** - Possível acesso a relação em serialização
  ```python
  and macosversion >= "10.4"
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pkg_resources/__init__.py:1144** - Possível acesso a relação em serialização
  ```python
  optional string naming the desired version of Python (e.g. ``'3.6'``);
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pkg_resources/__init__.py:1557** - Possível acesso a relação em serialização
  ```python
  >>> parse_version(_forgiving_version('0.23ubuntu1'))
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pkg_resources/__init__.py:1924** - Possível acesso a relação em serialização
  ```python
  class ZipManifests(Dict[str, "MemoizedZipManifests.manifest_mod"]):
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pkg_resources/__init__.py:2031** - Possível acesso a relação em serialização
  ```python
  # FIXME: 'ZipProvider._extract_resource' is too complex (12)
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pkg_resources/__init__.py:2043** - Possível acesso a relação em serialização
  ```python
  '"os.rename" and "os.unlink" are not supported on this platform'
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pkg_resources/__init__.py:2043** - Possível acesso a relação em serialização
  ```python
  '"os.rename" and "os.unlink" are not supported on this platform'
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pkg_resources/__init__.py:2105** - Possível acesso a relação em serialização
  ```python
  for name in ('native_libs.txt', 'eager_resources.txt'):
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pkg_resources/__init__.py:2105** - Possível acesso a relação em serialização
  ```python
  for name in ('native_libs.txt', 'eager_resources.txt'):
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pkg_resources/__init__.py:3063** - Possível acesso a relação em serialização
  ```python
  for name in 'requires.txt', 'depends.txt':
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pkg_resources/__init__.py:3063** - Possível acesso a relação em serialização
  ```python
  for name in 'requires.txt', 'depends.txt':
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pkg_resources/__init__.py:3114** - Possível acesso a relação em serialização
  ```python
  for pkg in self._get_metadata('namespace_packages.txt'):
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pkg_resources/__init__.py:3191** - Possível acesso a relação em serialização
  ```python
  self._get_metadata('entry_points.txt'), self
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pkg_resources/__init__.py:3201** - Possível acesso a relação em serialização
  ```python
  # FIXME: 'Distribution.insert_on' is too complex (13)
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pkg_resources/__init__.py:3280** - Possível acesso a relação em serialização
  ```python
  nsp = dict.fromkeys(self._get_metadata('namespace_packages.txt'))
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pkg_resources/__init__.py:3282** - Possível acesso a relação em serialização
  ```python
  for modname in self._get_metadata('top_level.txt'):
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/pkg_resources/__init__.py:3510** - Possível acesso a relação em serialização
  ```python
  raise OSError('"os.mkdir" not supported on this platform.')
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/resolvelib/structs.py:81** - Loop com query de relação
  ```python
  for f in self._forwards.pop(key):
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/resolvelib/structs.py:81** - Acesso a atributo de relação em loop
  ```python
  for f in self._forwards.pop(key):
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/resolvelib/resolvers/exceptions.py:26** - Acesso a atributo de relação em loop
  ```python
  ", ".join(repr(r) for r in self.criterion.iter_requirement()),
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/resolvelib/resolvers/resolution.py:48** - Acesso a atributo de relação em loop
  ```python
  for p in criterion.iter_parent():
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/platformdirs/unix.py:55** - Loop com query de relação
  ```python
  return [self._append_app_name_and_version(p) for p in path.split(os.pathsep)]
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/platformdirs/unix.py:55** - Acesso a atributo de relação em loop
  ```python
  return [self._append_app_name_and_version(p) for p in path.split(os.pathsep)]
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/platformdirs/android.py:148** - Acesso a atributo de relação em loop
  ```python
  for path in sys.path:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/platformdirs/windows.py:241** - Acesso a atributo de relação em loop
  ```python
  if any(ord(c) > 255 for c in buf):  # noqa: PLR2004
  ```

- **apps/api/venv/lib/python3.9/site-packages/pip/_vendor/platformdirs/__main__.py:34** - Possível acesso a relação em serialização
  ```python
  dirs = PlatformDirs(app_name, app_author, version="1.0")
  ```

- **apps/api/venv/lib/python3.9/site-packages/tomli/_parser.py:35** - Acesso a atributo de relação em loop
  ```python
  ASCII_CTRL: Final = frozenset(chr(i) for i in range(32)) | frozenset(chr(127))
  ```

- **apps/api/venv/lib/python3.9/site-packages/tomli/_parser.py:137** - Possível acesso a relação em serialização
  ```python
  "File must be opened in binary mode, e.g. use `open('foo.toml', 'rb')`"
  ```

- **apps/api/venv/lib/python3.9/site-packages/certifi/core.py:40** - Possível acesso a relação em serialização
  ```python
  _CACERT_CTX = as_file(files("certifi").joinpath("cacert.pem"))
  ```

- **apps/api/venv/lib/python3.9/site-packages/certifi/core.py:47** - Possível acesso a relação em serialização
  ```python
  return files("certifi").joinpath("cacert.pem").read_text(encoding="ascii")
  ```

- **apps/api/venv/lib/python3.9/site-packages/certifi/core.py:76** - Possível acesso a relação em serialização
  ```python
  _CACERT_CTX = get_path("certifi", "cacert.pem")
  ```

- **apps/api/venv/lib/python3.9/site-packages/certifi/core.py:83** - Possível acesso a relação em serialização
  ```python
  return read_text("certifi", "cacert.pem", encoding="ascii")
  ```

- **apps/api/venv/lib/python3.9/site-packages/blib2to3/pygram.py:16** - Possível acesso a relação em serialização
  ```python
  # _GRAMMAR_FILE = os.path.join(os.path.dirname(__file__), "Grammar.txt")
  ```

- **apps/api/venv/lib/python3.9/site-packages/blib2to3/pygram.py:18** - Possível acesso a relação em serialização
  ```python
  #                                      "PatternGrammar.txt")
  ```

- **apps/api/venv/lib/python3.9/site-packages/blib2to3/pygram.py:170** - Possível acesso a relação em serialização
  ```python
  _GRAMMAR_FILE = os.path.join(os.path.dirname(__file__), "Grammar.txt")
  ```

- **apps/api/venv/lib/python3.9/site-packages/blib2to3/pygram.py:172** - Possível acesso a relação em serialização
  ```python
  os.path.dirname(__file__), "PatternGrammar.txt"
  ```

- **apps/api/venv/lib/python3.9/site-packages/blib2to3/pytree.py:47** - Acesso a atributo de relação em loop
  ```python
  for name in dir(python_symbols):
  ```

- **apps/api/venv/lib/python3.9/site-packages/blib2to3/pgen2/token.py:1** - Possível acesso a relação em serialização
  ```python
  """Token constants (from "token.h")."""
  ```

- **apps/api/venv/lib/python3.9/site-packages/blib2to3/pgen2/pgen.py:55** - Loop com query de relação
  ```python
  for name in names:
  ```

- **apps/api/venv/lib/python3.9/site-packages/blib2to3/pgen2/pgen.py:55** - Acesso a atributo de relação em loop
  ```python
  for name in names:
  ```

- **apps/api/venv/lib/python3.9/site-packages/blib2to3/pgen2/pgen.py:426** - Possível acesso a relação em serialização
  ```python
  def generate_grammar(filename: Path = "Grammar.txt") -> PgenGrammar:
  ```

- **apps/api/venv/lib/python3.9/site-packages/blib2to3/pgen2/conv.py:90** - Possível acesso a relação em serialização
  ```python
  #include "pgenheaders.h"
  ```

- **apps/api/venv/lib/python3.9/site-packages/blib2to3/pgen2/conv.py:91** - Possível acesso a relação em serialização
  ```python
  #include "grammar.h"
  ```

- **apps/api/venv/lib/python3.9/site-packages/blib2to3/pgen2/conv.py:123** - Possível acesso a relação em serialização
  ```python
  assert line == '#include "pgenheaders.h"\n', (lineno, line)
  ```

- **apps/api/venv/lib/python3.9/site-packages/blib2to3/pgen2/conv.py:125** - Possível acesso a relação em serialização
  ```python
  assert line == '#include "grammar.h"\n', (lineno, line)
  ```

- **apps/api/venv/lib/python3.9/site-packages/blib2to3/pgen2/parse.py:67** - Loop com query de relação
  ```python
  self._points = {ilabel: stack_copy(self._start_point) for ilabel in ilabels}
  ```

- **apps/api/venv/lib/python3.9/site-packages/blib2to3/pgen2/parse.py:67** - Acesso a atributo de relação em loop
  ```python
  self._points = {ilabel: stack_copy(self._start_point) for ilabel in ilabels}
  ```

- **apps/api/venv/lib/python3.9/site-packages/blib2to3/pgen2/driver.py:84** - Acesso a atributo de relação em loop
  ```python
  for release_range in self._release_ranges:
  ```

- **apps/api/venv/lib/python3.9/site-packages/blib2to3/pgen2/driver.py:243** - Possível acesso a relação em serialização
  ```python
  gt: str = "Grammar.txt",
  ```

- **apps/api/venv/lib/python3.9/site-packages/blib2to3/pgen2/tokenize.py:71** - Acesso a atributo de relação em loop
  ```python
  __all__ = [x for x in dir(token) if x[0] != "_"] + [
  ```

- **apps/api/venv/lib/python3.9/site-packages/pluggy/_hooks.py:332** - Loop com query de relação
  ```python
  for param in _valid_params.values()
  ```

- **apps/api/venv/lib/python3.9/site-packages/pluggy/_hooks.py:332** - Acesso a atributo de relação em loop
  ```python
  for param in _valid_params.values()
  ```

- **apps/api/venv/lib/python3.9/site-packages/pluggy/_manager.py:156** - Loop com query de relação
  ```python
  for name in dir(plugin):
  ```

- **apps/api/venv/lib/python3.9/site-packages/pluggy/_manager.py:156** - Acesso a atributo de relação em loop
  ```python
  for name in dir(plugin):
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/command.py:31** - Acesso a atributo de relação em loop
  ```python
  for tempname in os.listdir(config.get_template_directory()):
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/command.py:108** - Possível acesso a relação em serialização
  ```python
  os.path.join(os.path.abspath(directory), "__init__.py"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/command.py:109** - Possível acesso a relação em serialização
  ```python
  os.path.join(os.path.abspath(versions), "__init__.py"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/config.py:84** - Loop com query de relação
  ```python
  for substitution in the alembic config file.  The dictionary as given
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/config.py:84** - Acesso a atributo de relação em loop
  ```python
  for substitution in the alembic config file.  The dictionary as given
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/config.py:56** - Possível acesso a relação em serialização
  ```python
  alembic_cfg.set_main_option("sqlalchemy.url", "postgresql://foo/bar")
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/config.py:531** - Possível acesso a relação em serialização
  ```python
  default=os.environ.get("ALEMBIC_CONFIG", "alembic.ini"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/config.py:533** - Possível acesso a relação em serialização
  ```python
  'ALEMBIC_CONFIG environment variable, or "alembic.ini"',
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/config.py:570** - Possível acesso a relação em serialização
  ```python
  and fn.__module__ == "alembic.command"
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/util/pyfiles.py:62** - Acesso a atributo de relação em loop
  ```python
  for tok in tokens[1:]:
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/util/langhelpers.py:79** - Acesso a atributo de relação em loop
  ```python
  for attr_name in attr_names:
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/util/editor.py:81** - Possível acesso a relação em serialização
  ```python
  return ["code.exe", "notepad++.exe", "notepad.exe"]
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/util/editor.py:81** - Possível acesso a relação em serialização
  ```python
  return ["code.exe", "notepad++.exe", "notepad.exe"]
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/util/sqla_compat.py:74** - Acesso a atributo de relação em loop
  ```python
  [_safe_int(x) for x in re.findall(r"(\d+|[abc]\d)", __version__)]
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/util/messaging.py:43** - Acesso a atributo de relação em loop
  ```python
  for t in text:
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/ddl/postgresql.py:90** - Loop com query de relação
  ```python
  for col in postgresql_include:
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/ddl/postgresql.py:90** - Acesso a atributo de relação em loop
  ```python
  for col in postgresql_include:
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/ddl/mssql.py:180** - Acesso a atributo de relação em loop
  ```python
  for col in mssql_include:
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/ddl/mssql.py:157** - Possível acesso a relação em serialização
  ```python
  "sys.default_constraints",
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/ddl/mssql.py:212** - Possível acesso a relação em serialização
  ```python
  table_name, column, "sys.default_constraints", schema
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/ddl/mssql.py:219** - Possível acesso a relação em serialização
  ```python
  table_name, column, "sys.check_constraints", schema
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/ddl/_autogen.py:178** - Acesso a atributo de relação em loop
  ```python
  self._sig = tuple(sorted([col.name for col in const.columns]))
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/ddl/sqlite.py:57** - Acesso a atributo de relação em loop
  ```python
  for op in batch_op.batch:
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/ddl/impl.py:370** - Acesso a atributo de relação em loop
  ```python
  for index in table.indexes:
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/ddl/base.py:275** - Acesso a atributo de relação em loop
  ```python
  result = ".".join([quote(x) for x in name.split(".")])
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/ddl/mysql.py:247** - Acesso a atributo de relação em loop
  ```python
  for idx in list(conn_indexes):
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/runtime/environment.py:409** - Loop com query de relação
  ```python
  for arg in value:
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/runtime/environment.py:409** - Acesso a atributo de relação em loop
  ```python
  for arg in value:
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/runtime/migration.py:528** - Loop com query de relação
  ```python
  for sfr in util.to_list(start_from_rev)
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/runtime/migration.py:528** - Acesso a atributo de relação em loop
  ```python
  for sfr in util.to_list(start_from_rev)
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/operations/schemaobj.py:55** - Acesso a atributo de relação em loop
  ```python
  columns = [sa_schema.Column(n, NULLTYPE) for n in cols]
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/operations/batch.py:236** - Acesso a atributo de relação em loop
  ```python
  (c.name, {"expr": c}) for c in self.table.c
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/operations/ops.py:417** - Acesso a atributo de relação em loop
  ```python
  [c.name for c in uq_constraint.columns],
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/operations/ops.py:2112** - Possível acesso a relação em serialização
  ```python
  Column("account_id", INTEGER, ForeignKey("accounts.id")),
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/operations/toimpl.py:49** - Acesso a atributo de relação em loop
  ```python
  for constraint in t.constraints:
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/operations/toimpl.py:19** - Possível acesso a relação em serialização
  ```python
  operations: "Operations", operation: "ops.AlterColumnOp"
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/operations/toimpl.py:81** - Possível acesso a relação em serialização
  ```python
  def drop_table(operations: "Operations", operation: "ops.DropTableOp") -> None:
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/operations/toimpl.py:89** - Possível acesso a relação em serialização
  ```python
  operations: "Operations", operation: "ops.DropColumnOp"
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/operations/toimpl.py:99** - Possível acesso a relação em serialização
  ```python
  operations: "Operations", operation: "ops.CreateIndexOp"
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/operations/toimpl.py:112** - Possível acesso a relação em serialização
  ```python
  def drop_index(operations: "Operations", operation: "ops.DropIndexOp") -> None:
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/operations/toimpl.py:128** - Possível acesso a relação em serialização
  ```python
  operations: "Operations", operation: "ops.CreateTableOp"
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/operations/toimpl.py:137** - Possível acesso a relação em serialização
  ```python
  operations: "Operations", operation: "ops.RenameTableOp"
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/operations/toimpl.py:146** - Possível acesso a relação em serialização
  ```python
  operations: "Operations", operation: "ops.CreateTableCommentOp"
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/operations/toimpl.py:154** - Possível acesso a relação em serialização
  ```python
  operations: "Operations", operation: "ops.DropTableCommentOp"
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/operations/toimpl.py:161** - Possível acesso a relação em serialização
  ```python
  def add_column(operations: "Operations", operation: "ops.AddColumnOp") -> None:
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/operations/toimpl.py:190** - Possível acesso a relação em serialização
  ```python
  operations: "Operations", operation: "ops.AddConstraintOp"
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/operations/toimpl.py:199** - Possível acesso a relação em serialização
  ```python
  operations: "Operations", operation: "ops.DropConstraintOp"
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/operations/toimpl.py:213** - Possível acesso a relação em serialização
  ```python
  operations: "Operations", operation: "ops.BulkInsertOp"
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/operations/toimpl.py:222** - Possível acesso a relação em serialização
  ```python
  operations: "Operations", operation: "ops.ExecuteSQLOp"
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/operations/base.py:488** - Acesso a atributo de relação em loop
  ```python
  r"""Produce an 'inline literal' expression, suitable for
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/operations/base.py:675** - Possível acesso a relação em serialização
  ```python
  Column("account_id", INTEGER, ForeignKey("accounts.id")),
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/script/revision.py:210** - Acesso a atributo de relação em loop
  ```python
  for revision in self._generator():
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/script/base.py:126** - Acesso a atributo de relação em loop
  ```python
  for location in self.version_locations
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/script/base.py:583** - Possível acesso a relação em serialização
  ```python
  util.load_python_file(self.dir, "env.py")
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/script/base.py:587** - Possível acesso a relação em serialização
  ```python
  return os.path.abspath(os.path.join(self.dir, "env.py"))
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/script/base.py:614** - Possível acesso a relação em serialização
  ```python
  "the 'backports.zoneinfo' package must be installed."
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/testing/env.py:36** - Possível acesso a relação em serialização
  ```python
  util.load_python_file(path, "env.py")
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/testing/env.py:50** - Possível acesso a relação em serialização
  ```python
  os.path.join(path, "env.py"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/testing/env.py:83** - Possível acesso a relação em serialização
  ```python
  path = os.path.join(dir_, "env.py")
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/testing/env.py:92** - Possível acesso a relação em serialização
  ```python
  def _sqlite_file_db(tempname="foo.db", future=False, scope=None, **options):
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/testing/env.py:253** - Possível acesso a relação em serialização
  ```python
  return Config(os.path.join(_get_staging_directory(), "test_alembic.ini"))
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/testing/util.py:50** - Acesso a atributo de relação em loop
  ```python
  for d in combinations:
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/testing/fixtures.py:171** - Acesso a atributo de relação em loop
  ```python
  eq_(buf.lines, [re.sub(r"[\n\t]", "", s) for s in sql])
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/testing/fixtures.py:35** - Possível acesso a relação em serialização
  ```python
  testing_config.read(["test.cfg"])
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/testing/suite/_autogen_fixtures.py:195** - Acesso a atributo de relação em loop
  ```python
  eq_([elem.column.name for elem in diff[1].elements], target_columns)
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/testing/suite/_autogen_fixtures.py:99** - Possível acesso a relação em serialização
  ```python
  Column("uid", Integer, ForeignKey("user.id")),
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/testing/suite/_autogen_fixtures.py:137** - Possível acesso a relação em serialização
  ```python
  Column("user_id", Integer, ForeignKey("user.id")),
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/testing/suite/_autogen_fixtures.py:146** - Possível acesso a relação em serialização
  ```python
  Column("order_id", Integer, ForeignKey("order.order_id")),
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/autogenerate/render.py:108** - Loop com query de relação
  ```python
  for op in op_container.ops:
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/autogenerate/render.py:108** - Acesso a atributo de relação em loop
  ```python
  for op in op_container.ops:
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/autogenerate/render.py:815** - Possível acesso a relação em serialização
  ```python
  if mod.startswith("sqlalchemy.dialects"):
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/autogenerate/render.py:887** - Possível acesso a relação em serialização
  ```python
  if mod.startswith("sqlalchemy.dialects"):
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/autogenerate/rewriter.py:146** - Acesso a atributo de relação em loop
  ```python
  for r_directive in util.to_list(
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/autogenerate/api.py:437** - Acesso a atributo de relação em loop
  ```python
  for fn in self._name_filters:
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/autogenerate/compare.py:94** - Acesso a atributo de relação em loop
  ```python
  s for s in schemas if autogen_context.run_name_filters(s, "schema", {})
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/autogenerate/compare.py:168** - Possível acesso a relação em serialização
  ```python
  # as "schemaname.tablename" or just "tablename", create a new lookup
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/templates/async/env.py:43** - Possível acesso a relação em serialização
  ```python
  url = config.get_main_option("sqlalchemy.url")
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/templates/multidb/env.py:62** - Acesso a atributo de relação em loop
  ```python
  for name in re.split(r",\s*", db_names):
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/templates/multidb/env.py:20** - Possível acesso a relação em serialização
  ```python
  logger = logging.getLogger("alembic.env")
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/templates/multidb/env.py:64** - Possível acesso a relação em serialização
  ```python
  rec["url"] = context.config.get_section_option(name, "sqlalchemy.url")
  ```

- **apps/api/venv/lib/python3.9/site-packages/alembic/templates/generic/env.py:41** - Possível acesso a relação em serialização
  ```python
  url = config.get_main_option("sqlalchemy.url")
  ```

- **apps/api/venv/lib/python3.9/site-packages/blackd/__init__.py:200** - Acesso a atributo de relação em loop
  ```python
  for version in value.split(","):
  ```

- **apps/api/venv/lib/python3.9/site-packages/blackd/__init__.py:224** - Possível acesso a relação em serialização
  ```python
  raise InvalidVariantHeader("expected e.g. '3.7', 'py3.5'") from None
  ```

- **apps/api/venv/lib/python3.9/site-packages/blackd/__init__.py:224** - Possível acesso a relação em serialização
  ```python
  raise InvalidVariantHeader("expected e.g. '3.7', 'py3.5'") from None
  ```

- **apps/api/venv/lib/python3.9/site-packages/urllib3/filepost.py:44** - Acesso a atributo de relação em loop
  ```python
  for field in iterable:
  ```

- **apps/api/venv/lib/python3.9/site-packages/urllib3/fields.py:64** - Loop com query de relação
  ```python
  if not any(ch in value for ch in '"\\\r\n'):
  ```

- **apps/api/venv/lib/python3.9/site-packages/urllib3/fields.py:64** - Acesso a atributo de relação em loop
  ```python
  if not any(ch in value for ch in '"\\\r\n'):
  ```

- **apps/api/venv/lib/python3.9/site-packages/urllib3/fields.py:215** - Possível acesso a relação em serialização
  ```python
  'fakefile': ('foofile.txt', 'contents of foofile'),
  ```

- **apps/api/venv/lib/python3.9/site-packages/urllib3/fields.py:216** - Possível acesso a relação em serialização
  ```python
  'realfile': ('barfile.txt', open('realfile').read()),
  ```

- **apps/api/venv/lib/python3.9/site-packages/urllib3/fields.py:217** - Possível acesso a relação em serialização
  ```python
  'typedfile': ('bazfile.bin', open('bazfile').read(), 'image/jpeg'),
  ```

- **apps/api/venv/lib/python3.9/site-packages/urllib3/poolmanager.py:123** - Loop com query de relação
  ```python
  for key in ("headers", "_proxy_headers", "_socks_options"):
  ```

- **apps/api/venv/lib/python3.9/site-packages/urllib3/poolmanager.py:123** - Acesso a atributo de relação em loop
  ```python
  for key in ("headers", "_proxy_headers", "_socks_options"):
  ```

- **apps/api/venv/lib/python3.9/site-packages/urllib3/response.py:224** - Loop com query de relação
  ```python
  self._decoders = [_get_decoder(m.strip()) for m in modes.split(",")]
  ```

- **apps/api/venv/lib/python3.9/site-packages/urllib3/response.py:224** - Acesso a atributo de relação em loop
  ```python
  self._decoders = [_get_decoder(m.strip()) for m in modes.split(",")]
  ```

- **apps/api/venv/lib/python3.9/site-packages/urllib3/connection.py:312** - Acesso a atributo de relação em loop
  ```python
  for header in self._raw_proxy_headers:
  ```

- **apps/api/venv/lib/python3.9/site-packages/urllib3/_collections.py:148** - Acesso a atributo de relação em loop
  ```python
  for value in values:
  ```

- **apps/api/venv/lib/python3.9/site-packages/urllib3/_request_methods.py:214** - Possível acesso a relação em serialização
  ```python
  'fakefile': ('foofile.txt', 'contents of foofile'),
  ```

- **apps/api/venv/lib/python3.9/site-packages/urllib3/_request_methods.py:215** - Possível acesso a relação em serialização
  ```python
  'realfile': ('barfile.txt', open('realfile').read()),
  ```

- **apps/api/venv/lib/python3.9/site-packages/urllib3/_request_methods.py:216** - Possível acesso a relação em serialização
  ```python
  'typedfile': ('bazfile.bin', open('bazfile').read(),
  ```

- **apps/api/venv/lib/python3.9/site-packages/urllib3/connectionpool.py:209** - Loop com query de relação
  ```python
  for _ in range(maxsize):
  ```

- **apps/api/venv/lib/python3.9/site-packages/urllib3/connectionpool.py:209** - Acesso a atributo de relação em loop
  ```python
  for _ in range(maxsize):
  ```

- **apps/api/venv/lib/python3.9/site-packages/urllib3/util/ssltransport.py:37** - Acesso a atributo de relação em loop
  ```python
  for TLS in TLS.
  ```

- **apps/api/venv/lib/python3.9/site-packages/urllib3/util/response.py:81** - Acesso a atributo de relação em loop
  ```python
  for defect in headers.defects
  ```

- **apps/api/venv/lib/python3.9/site-packages/urllib3/util/ssl_.py:129** - Loop com query de relação
  ```python
  for attr in ("TLSv1", "TLSv1_1", "TLSv1_2"):
  ```

- **apps/api/venv/lib/python3.9/site-packages/urllib3/util/ssl_.py:129** - Acesso a atributo de relação em loop
  ```python
  for attr in ("TLSv1", "TLSv1_1", "TLSv1_2"):
  ```

- **apps/api/venv/lib/python3.9/site-packages/urllib3/util/ssl_.py:90** - Possível acesso a relação em serialização
  ```python
  # Mapping from 'ssl.PROTOCOL_TLSX' to 'TLSVersion.X'
  ```

- **apps/api/venv/lib/python3.9/site-packages/urllib3/util/ssl_.py:90** - Possível acesso a relação em serialização
  ```python
  # Mapping from 'ssl.PROTOCOL_TLSX' to 'TLSVersion.X'
  ```

- **apps/api/venv/lib/python3.9/site-packages/urllib3/util/ssl_.py:243** - Possível acesso a relação em serialização
  ```python
  The minimum version of TLS to be used. Use the 'ssl.TLSVersion' enum for specifying the value.
  ```

- **apps/api/venv/lib/python3.9/site-packages/urllib3/util/ssl_.py:245** - Possível acesso a relação em serialização
  ```python
  The maximum version of TLS to be used. Use the 'ssl.TLSVersion' enum for specifying the value.
  ```

- **apps/api/venv/lib/python3.9/site-packages/urllib3/util/ssl_.py:289** - Possível acesso a relação em serialização
  ```python
  # keep the maximum version to be it's default value: 'TLSVersion.MAXIMUM_SUPPORTED'
  ```

- **apps/api/venv/lib/python3.9/site-packages/urllib3/util/retry.py:243** - Loop com query de relação
  ```python
  h.lower() for h in remove_headers_on_redirect
  ```

- **apps/api/venv/lib/python3.9/site-packages/urllib3/util/retry.py:243** - Acesso a atributo de relação em loop
  ```python
  h.lower() for h in remove_headers_on_redirect
  ```

- **apps/api/venv/lib/python3.9/site-packages/urllib3/util/url.py:52** - Acesso a atributo de relação em loop
  ```python
  _IPV6_PAT = "(?:" + "|".join([x % _subs for x in _variations]) + ")"
  ```

- **apps/api/venv/lib/python3.9/site-packages/urllib3/util/url.py:183** - Possível acesso a relação em serialização
  ```python
  "host.com", 80, "/path", "query", "fragment"
  ```

- **apps/api/venv/lib/python3.9/site-packages/urllib3/util/url.py:387** - Possível acesso a relação em serialização
  ```python
  # Url(scheme='http', host='google.com', port=None, path='/mail/', ...)
  ```

- **apps/api/venv/lib/python3.9/site-packages/urllib3/util/url.py:390** - Possível acesso a relação em serialização
  ```python
  # Url(scheme=None, host='google.com', port=80, path=None, ...)
  ```

- **apps/api/venv/lib/python3.9/site-packages/urllib3/util/connection.py:60** - Acesso a atributo de relação em loop
  ```python
  for res in socket.getaddrinfo(host, port, family, socket.SOCK_STREAM):
  ```

- **apps/api/venv/lib/python3.9/site-packages/urllib3/util/ssl_match_hostname.py:73** - Acesso a atributo de relação em loop
  ```python
  for frag in remainder:
  ```

- **apps/api/venv/lib/python3.9/site-packages/urllib3/contrib/pyopenssl.py:208** - Acesso a atributo de relação em loop
  ```python
  for prefix in ["*.", "."]:
  ```

- **apps/api/venv/lib/python3.9/site-packages/urllib3/contrib/emscripten/fetch.py:162** - Acesso a atributo de relação em loop
  ```python
  "No buffer for stream in _ReadStream.readinto",
  ```

- **apps/api/venv/lib/python3.9/site-packages/urllib3/contrib/emscripten/fetch.py:72** - Possível acesso a relação em serialização
  ```python
  .joinpath("emscripten_fetch_worker.js")
  ```

- **apps/api/venv/lib/python3.9/site-packages/urllib3/contrib/emscripten/response.py:113** - Acesso a atributo de relação em loop
  ```python
  lengths = {int(val) for val in content_length.split(",")}
  ```

- **apps/api/venv/lib/python3.9/site-packages/urllib3/http2/connection.py:150** - Acesso a atributo de relação em loop
  ```python
  for value in values:
  ```

- **apps/api/venv/lib/python3.9/site-packages/blinker/base.py:242** - Loop com query de relação
  ```python
  for receiver in self.receivers_for(sender):
  ```

- **apps/api/venv/lib/python3.9/site-packages/blinker/base.py:242** - Acesso a atributo de relação em loop
  ```python
  for receiver in self.receivers_for(sender):
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/windows_support.py:20** - Possível acesso a relação em serialização
  ```python
  __import__('ctypes.wintypes')
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/package_index.py:101** - Loop com query de relação
  ```python
  for dist in distros_for_location(url, base, metadata):
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/package_index.py:101** - Acesso a atributo de relação em loop
  ```python
  for dist in distros_for_location(url, base, metadata):
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/package_index.py:91** - Possível acesso a relação em serialização
  ```python
  if server == 'sourceforge.net' and base == 'download':  # XXX Yuck
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/package_index.py:297** - Possível acesso a relação em serialização
  ```python
  # FIXME: 'PackageIndex.process_url' is too complex (14)
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/package_index.py:680** - Possível acesso a relação em serialização
  ```python
  with open(os.path.join(tmpdir, 'setup.py'), 'w') as file:
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/package_index.py:1101** - Possível acesso a relação em serialização
  ```python
  if f == 'index.html':
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/archive_util.py:51** - Acesso a atributo de relação em loop
  ```python
  for driver in drivers or extraction_drivers:
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_imp.py:35** - Possível acesso a relação em serialização
  ```python
  spec = importlib.util.spec_from_loader('__init__.py', spec.loader)
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/config.py:37** - Loop com query de relação
  ```python
  for statement in self.module.body
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/config.py:37** - Acesso a atributo de relação em loop
  ```python
  for statement in self.module.body
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/config.py:670** - Possível acesso a relação em serialização
  ```python
  self.sections.get('packages.find', {})
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/depends.py:148** - Acesso a atributo de relação em loop
  ```python
  for byte_code in dis.Bytecode(code):
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/depends.py:134** - Possível acesso a relação em serialização
  ```python
  must be present in 'code.co_names'.
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/__init__.py:81** - Acesso a atributo de relação em loop
  ```python
  for dir in all_dirs:
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/__init__.py:101** - Possível acesso a relação em serialização
  ```python
  return os.path.isfile(os.path.join(path, '__init__.py'))
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/installer.py:54** - Acesso a atributo de relação em loop
  ```python
  for egg_dist in pkg_resources.find_distributions(eggs_dir):
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/glob.py:74** - Acesso a atributo de relação em loop
  ```python
  for dirname in dirs:
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/sandbox.py:162** - Loop com query de relação
  ```python
  for mod_name in sys.modules
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/sandbox.py:162** - Acesso a atributo de relação em loop
  ```python
  for mod_name in sys.modules
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/sandbox.py:218** - Possível acesso a relação em serialização
  ```python
  >>> _needs_hiding('setuptools.__init__')
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/sandbox.py:498** - Possível acesso a relação em serialização
  ```python
  self._violation("os.open", file, flags, mode, *args, **kw)
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/monkey.py:53** - Acesso a atributo de relação em loop
  ```python
  for cls in _get_mro(cls)
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/monkey.py:136** - Possível acesso a relação em serialização
  ```python
  msvc = import_module('setuptools.msvc')
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/monkey.py:155** - Possível acesso a relação em serialização
  ```python
  msvc9 = functools.partial(patch_params, 'distutils.msvc9compiler')
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/monkey.py:158** - Possível acesso a relação em serialização
  ```python
  msvc14 = functools.partial(patch_params, 'distutils._msvccompiler')
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/build_meta.py:95** - Acesso a atributo de relação em loop
  ```python
  return [name for name in os.listdir(a_dir)
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/build_meta.py:9** - Possível acesso a relação em serialização
  ```python
  than calling "setup.py" directly, the frontend should:
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/build_meta.py:141** - Possível acesso a relação em serialização
  ```python
  def run_setup(self, setup_script='setup.py'):
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/build_meta.py:241** - Possível acesso a relação em serialização
  ```python
  def run_setup(self, setup_script='setup.py'):
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/msvc.py:161** - Acesso a atributo de relação em loop
  ```python
  for i in itertools.count():
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/msvc.py:75** - Possível acesso a relação em serialização
  ```python
  Redirect the path of "vcvarsall.bat".
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/msvc.py:101** - Possível acesso a relação em serialização
  ```python
  vcvarsall = join(productdir, "vcvarsall.bat")
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/msvc.py:113** - Possível acesso a relação em serialização
  ```python
  Set environment without use of "vcvarsall.bat".
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/msvc.py:194** - Possível acesso a relação em serialização
  ```python
  join(root, "Microsoft Visual Studio", "Installer", "vswhere.exe"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/msvc.py:234** - Possível acesso a relação em serialização
  ```python
  "vcruntime140.dll")
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/msvc.py:245** - Possível acesso a relação em serialização
  ```python
  "Microsoft.VC140.CRT", "vcruntime140.dll")
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/msvc.py:250** - Possível acesso a relação em serialização
  ```python
  vcvarsall = join(best_dir, "vcvarsall.bat")
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/msvc.py:301** - Possível acesso a relação em serialização
  ```python
  Set environment without use of "vcvarsall.bat".
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/msvc.py:325** - Possível acesso a relação em serialização
  ```python
  compatibility between "numpy.distutils" and "distutils._msvccompiler"
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/msvc.py:325** - Possível acesso a relação em serialização
  ```python
  compatibility between "numpy.distutils" and "distutils._msvccompiler"
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/msvc.py:328** - Possível acesso a relação em serialização
  ```python
  if "numpy.distutils" in sys.modules:
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/msvc.py:773** - Possível acesso a relação em serialização
  ```python
  # Get VS installation path from "state.json" file
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/msvc.py:774** - Possível acesso a relação em serialização
  ```python
  state_path = join(instances_dir, name, 'state.json')
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/msvc.py:787** - Possível acesso a relação em serialização
  ```python
  # Skip if "state.json" file is missing or bad format
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/msvc.py:905** - Possível acesso a relação em serialização
  ```python
  return '7.0', '6.1', '6.0a'
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/msvc.py:905** - Possível acesso a relação em serialização
  ```python
  return '7.0', '6.1', '6.0a'
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/msvc.py:905** - Possível acesso a relação em serialização
  ```python
  return '7.0', '6.1', '6.0a'
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/msvc.py:907** - Possível acesso a relação em serialização
  ```python
  return '7.1', '7.0a'
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/msvc.py:907** - Possível acesso a relação em serialização
  ```python
  return '7.1', '7.0a'
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/msvc.py:909** - Possível acesso a relação em serialização
  ```python
  return '8.0', '8.0a'
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/msvc.py:909** - Possível acesso a relação em serialização
  ```python
  return '8.0', '8.0a'
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/msvc.py:911** - Possível acesso a relação em serialização
  ```python
  return '8.1', '8.1a'
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/msvc.py:911** - Possível acesso a relação em serialização
  ```python
  return '8.1', '8.1a'
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/msvc.py:913** - Possível acesso a relação em serialização
  ```python
  return '10.0', '8.1'
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/msvc.py:913** - Possível acesso a relação em serialização
  ```python
  return '10.0', '8.1'
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/msvc.py:1061** - Possível acesso a relação em serialização
  ```python
  return (('4.7.2', '4.7.1', '4.7',
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/msvc.py:1062** - Possível acesso a relação em serialização
  ```python
  '4.6.2', '4.6.1', '4.6',
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/msvc.py:1063** - Possível acesso a relação em serialização
  ```python
  '4.5.2', '4.5.1', '4.5')
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/msvc.py:1161** - Possível acesso a relação em serialização
  ```python
  return ver, 'v4.0'
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/msvc.py:1163** - Possível acesso a relação em serialização
  ```python
  return 'v4.0.30319' if ver.lower()[:2] != 'v4' else ver, 'v3.5'
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/msvc.py:1165** - Possível acesso a relação em serialização
  ```python
  return 'v3.5', 'v2.0.50727'
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/msvc.py:1167** - Possível acesso a relação em serialização
  ```python
  return 'v3.0', 'v2.0.50727'
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/msvc.py:1203** - Possível acesso a relação em serialização
  ```python
  "vcvars[...].bat", "SetEnv.Cmd", "vcbuildtools.bat", ...
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/msvc.py:1203** - Possível acesso a relação em serialização
  ```python
  "vcvars[...].bat", "SetEnv.Cmd", "vcbuildtools.bat", ...
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/msvc.py:1431** - Possível acesso a relação em serialização
  ```python
  self.si.WindowsSdkDir, 'ExtensionSDKs', 'Microsoft.VCLibs',
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/dist.py:186** - Loop com query de relação
  ```python
  for project_url in self.project_urls.items():
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/dist.py:186** - Acesso a atributo de relação em loop
  ```python
  for project_url in self.project_urls.items():
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/dist.py:58** - Possível acesso a relação em serialização
  ```python
  mv = StrictVersion('2.1')
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/dist.py:124** - Possível acesso a relação em serialização
  ```python
  if self.long_description is None and self.metadata_version >= StrictVersion('2.1'):
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/dist.py:135** - Possível acesso a relação em serialização
  ```python
  if self.metadata_version == StrictVersion('1.1'):
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/dist.py:377** - Possível acesso a relação em serialização
  ```python
  '[easy_install]' section of your project's 'setup.cfg' file, and then
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/dist.py:396** - Possível acesso a relação em serialização
  ```python
  would be used on a 'unittest.py' command line.  That is, it is the
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/dist.py:451** - Possível acesso a relação em serialização
  ```python
  for ep in pkg_resources.iter_entry_points('distutils.setup_keywords'):
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/dist.py:610** - Possível acesso a relação em serialização
  ```python
  >>> list(Distribution._expand_patterns(['setup.cfg', 'LIC*']))
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/dist.py:611** - Possível acesso a relação em serialização
  ```python
  ['setup.cfg', 'LICENSE']
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/dist.py:620** - Possível acesso a relação em serialização
  ```python
  # FIXME: 'Distribution._parse_config_files' is too complex (14)
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/dist.py:702** - Possível acesso a relação em serialização
  ```python
  'options.extras_require',
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/dist.py:703** - Possível acesso a relação em serialização
  ```python
  'options.data_files',
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/dist.py:727** - Possível acesso a relação em serialização
  ```python
  return list(dist.get_entry_map('distutils.commands'))
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/dist.py:744** - Possível acesso a relação em serialização
  ```python
  # FIXME: 'Distribution._set_command_options' is too complex (14)
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/dist.py:753** - Possível acesso a relação em serialização
  ```python
  (from 'self.command_options').
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/dist.py:822** - Possível acesso a relação em serialização
  ```python
  group = 'setuptools.finalize_distribution_options'
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/dist.py:848** - Possível acesso a relação em serialização
  ```python
  for ep in pkg_resources.iter_entry_points('distutils.setup_keywords'):
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/dist.py:859** - Possível acesso a relação em serialização
  ```python
  readme_txt_filename = os.path.join(egg_cache_dir, 'README.txt')
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/dist.py:884** - Possível acesso a relação em serialização
  ```python
  eps = pkg_resources.iter_entry_points('distutils.commands', command)
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/dist.py:893** - Possível acesso a relação em serialização
  ```python
  for ep in pkg_resources.iter_entry_points('distutils.commands'):
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/dist.py:901** - Possível acesso a relação em serialização
  ```python
  for ep in pkg_resources.iter_entry_points('distutils.commands'):
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/wheel.py:34** - Acesso a atributo de relação em loop
  ```python
  for f in filenames:
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/wheel.py:118** - Possível acesso a relação em serialização
  ```python
  parse_version('1.0') <= wheel_version < parse_version('2.0dev0')
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/wheel.py:118** - Possível acesso a relação em serialização
  ```python
  parse_version('1.0') <= wheel_version < parse_version('2.0dev0')
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/wheel.py:166** - Possível acesso a relação em serialização
  ```python
  os.path.join(egg_info, 'requires.txt'),
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/wheel.py:202** - Possível acesso a relação em serialização
  ```python
  egg_info, 'namespace_packages.txt')
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/wheel.py:208** - Possível acesso a relação em serialização
  ```python
  mod_init = os.path.join(mod_dir, '__init__.py')
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/namespaces.py:46** - Possível acesso a relação em serialização
  ```python
  "importlib = has_mfs and __import__('importlib.util')",
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/namespaces.py:47** - Possível acesso a relação em serialização
  ```python
  "has_mfs and __import__('importlib.machinery')",
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/namespaces.py:93** - Possível acesso a relação em serialização
  ```python
  >>> set(names) == set(['a', 'a.b', 'a.b.c'])
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_vendor/ordered_set.py:91** - Acesso a atributo de relação em loop
  ```python
  return [self.items[i] for i in index]
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_vendor/ordered_set.py:19** - Possível acesso a relação em serialização
  ```python
  __version__ = "3.1"
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_vendor/pyparsing.py:177** - Loop com query de relação
  ```python
  for fname in "sum len sorted reversed list tuple set any all min max".split():
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_vendor/pyparsing.py:177** - Acesso a atributo de relação em loop
  ```python
  for fname in "sum len sorted reversed list tuple set any all min max".split():
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_vendor/pyparsing.py:347** - Possível acesso a relação em serialização
  ```python
  test("result.day")
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_vendor/pyparsing.py:712** - Possível acesso a relação em serialização
  ```python
  print(type(result), result) # -> <class 'pyparsing.ParseResults'> ['sldkj', 'lsdkj', 'sldkj']
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_vendor/pyparsing.py:729** - Possível acesso a relação em serialização
  ```python
  print(type(result), repr(result)) # -> <class 'pyparsing.ParseResults'> (['12', '/', '31', '/', '1999'], {'day': [('1999', 4)], 'year': [('12', 0)], 'month': [('31', 2)]})
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_vendor/pyparsing.py:3456** - Possível acesso a relação em serialização
  ```python
  [['123'], ['3.1416'], ['789']]
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_vendor/pyparsing.py:3538** - Possível acesso a relação em serialização
  ```python
  print(number.searchString("123 3.1416 789")) #  Better -> [['123'], ['3.1416'], ['789']]
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_vendor/pyparsing.py:4242** - Possível acesso a relação em serialização
  ```python
  print(real.parseString('3.1416')) # -> ['3', '.', '1416']
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_vendor/pyparsing.py:4247** - Possível acesso a relação em serialização
  ```python
  print(real.parseString('3.1416')) # -> ['3.1416']
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_vendor/pyparsing.py:4247** - Possível acesso a relação em serialização
  ```python
  print(real.parseString('3.1416')) # -> ['3.1416']
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_vendor/packaging/tags.py:14** - Acesso a atributo de relação em loop
  ```python
  EXTENSION_SUFFIXES = [x[0] for x in imp.get_suffixes()]
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_vendor/packaging/tags.py:184** - Possível acesso a relação em serialização
  ```python
  has_ext = "_d.pyd" in EXTENSION_SUFFIXES
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_vendor/packaging/tags.py:486** - Possível acesso a relação em serialização
  ```python
  # Call gnu_get_libc_version, which returns a string like "2.5"
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_vendor/packaging/version.py:189** - Acesso a atributo de relação em loop
  ```python
  for part in _legacy_version_component_re.split(s):
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_vendor/packaging/markers.py:149** - Acesso a atributo de relação em loop
  ```python
  return [_coerce_parse_result(i) for i in results]
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_vendor/packaging/markers.py:101** - Possível acesso a relação em serialização
  ```python
  | L("os.name")  # PEP-345
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_vendor/packaging/markers.py:102** - Possível acesso a relação em serialização
  ```python
  | L("sys.platform")  # PEP-345
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_vendor/packaging/markers.py:103** - Possível acesso a relação em serialização
  ```python
  | L("platform.version")  # PEP-345
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_vendor/packaging/markers.py:104** - Possível acesso a relação em serialização
  ```python
  | L("platform.machine")  # PEP-345
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_vendor/packaging/markers.py:105** - Possível acesso a relação em serialização
  ```python
  | L("platform.python_implementation")  # PEP-345
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_vendor/packaging/markers.py:110** - Possível acesso a relação em serialização
  ```python
  "os.name": "os_name",
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_vendor/packaging/markers.py:111** - Possível acesso a relação em serialização
  ```python
  "sys.platform": "sys_platform",
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_vendor/packaging/markers.py:112** - Possível acesso a relação em serialização
  ```python
  "platform.version": "platform_version",
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_vendor/packaging/markers.py:113** - Possível acesso a relação em serialização
  ```python
  "platform.machine": "platform_machine",
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_vendor/packaging/markers.py:114** - Possível acesso a relação em serialização
  ```python
  "platform.python_implementation": "platform_python_implementation",
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_vendor/packaging/__about__.py:21** - Possível acesso a relação em serialização
  ```python
  __version__ = "20.4"
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_vendor/packaging/specifiers.py:238** - Acesso a atributo de relação em loop
  ```python
  for version in iterable:
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_vendor/packaging/specifiers.py:214** - Possível acesso a relação em serialização
  ```python
  # a shortcut for ``"2.0" in Specifier(">=2")
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_vendor/more_itertools/more.py:150** - Acesso a atributo de relação em loop
  ```python
  for chunk in iterator:
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_vendor/more_itertools/more.py:1903** - Possível acesso a relação em serialização
  ```python
  >>> start = Decimal('2.1')
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_vendor/more_itertools/more.py:1904** - Possível acesso a relação em serialização
  ```python
  >>> stop = Decimal('5.1')
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_vendor/more_itertools/more.py:1906** - Possível acesso a relação em serialização
  ```python
  [Decimal('2.1'), Decimal('3.1'), Decimal('4.1')]
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_vendor/more_itertools/more.py:1906** - Possível acesso a relação em serialização
  ```python
  [Decimal('2.1'), Decimal('3.1'), Decimal('4.1')]
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_vendor/more_itertools/more.py:1906** - Possível acesso a relação em serialização
  ```python
  [Decimal('2.1'), Decimal('3.1'), Decimal('4.1')]
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_vendor/more_itertools/recipes.py:113** - Acesso a atributo de relação em loop
  ```python
  >>> i = (x for x in range(10))
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/command/bdist_egg.py:122** - Acesso a atributo de relação em loop
  ```python
  for item in old:
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/command/bdist_egg.py:197** - Possível acesso a relação em serialização
  ```python
  native_libs = os.path.join(egg_info, "native_libs.txt")
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/command/bdist_egg.py:215** - Possível acesso a relação em serialização
  ```python
  if os.path.exists(os.path.join(self.egg_info, 'depends.txt')):
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/command/bdist_egg.py:217** - Possível acesso a relação em serialização
  ```python
  "WARNING: 'depends.txt' will not be used by setuptools 0.6!\n"
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/command/bdist_egg.py:230** - Possível acesso a relação em serialização
  ```python
  # Add to 'Distribution.dist_files' so that the "upload" command works
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/command/alias.py:8** - Acesso a atributo de relação em loop
  ```python
  for c in '"', "'", "\\", "#":
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/command/py36compat.py:57** - Acesso a atributo de relação em loop
  ```python
  for fn in standards:
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/command/py36compat.py:77** - Possível acesso a relação em serialização
  ```python
  optional = ['test/test*.py', 'setup.cfg']
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/command/build_ext.py:68** - Acesso a atributo de relação em loop
  ```python
  for suffix in EXTENSION_SUFFIXES:
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/command/easy_install.py:204** - Loop com query de relação
  ```python
  filename for filename in blockers
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/command/easy_install.py:204** - Acesso a atributo de relação em loop
  ```python
  filename for filename in blockers
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/command/easy_install.py:280** - Possível acesso a relação em serialização
  ```python
  # Likewise, set default script_dir from 'install_scripts.install_dir'
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/command/easy_install.py:559** - Possível acesso a relação em serialização
  ```python
  alt = os.path.join(dirname, 'pythonw.exe')
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/command/easy_install.py:561** - Possível acesso a relação em serialização
  ```python
  basename.lower() == 'python.exe' and
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/command/easy_install.py:716** - Possível acesso a relação em serialização
  ```python
  # FIXME: 'easy_install.process_distribution' is too complex (12)
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/command/easy_install.py:728** - Possível acesso a relação em serialização
  ```python
  if (dist.has_metadata('dependency_links.txt') and
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/command/easy_install.py:731** - Possível acesso a relação em serialização
  ```python
  dist.get_metadata_lines('dependency_links.txt')
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/command/easy_install.py:814** - Possível acesso a relação em serialização
  ```python
  name = 'script.tmpl'
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/command/easy_install.py:869** - Possível acesso a relação em serialização
  ```python
  setup_script = os.path.join(setup_base, 'setup.py')
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/command/easy_install.py:872** - Possível acesso a relação em serialização
  ```python
  setups = glob(os.path.join(setup_base, '*', 'setup.py'))
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/command/easy_install.py:900** - Possível acesso a relação em serialização
  ```python
  # FIXME: 'easy_install.install_egg' is too complex (11)
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/command/easy_install.py:1000** - Possível acesso a relação em serialização
  ```python
  # FIXME: 'easy_install.exe_to_egg' is too complex (12)
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/command/easy_install.py:1196** - Possível acesso a relação em serialização
  ```python
  cfg_filename = os.path.join(base, 'setup.cfg')
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/command/easy_install.py:1234** - Possível acesso a relação em serialização
  ```python
  filename = os.path.join(self.install_dir, 'setuptools.pth')
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/command/easy_install.py:1405** - Possível acesso a relação em serialização
  ```python
  if 'Python.framework' not in prefix:
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/command/easy_install.py:1456** - Possível acesso a relação em serialização
  ```python
  if name in ('easy-install.pth', 'setuptools.pth'):
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/command/easy_install.py:2096** - Possível acesso a relação em serialização
  ```python
  executable = "python.exe"
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/command/easy_install.py:2199** - Possível acesso a relação em serialização
  ```python
  pattern = 'pythonw.exe'
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/command/easy_install.py:2200** - Possível acesso a relação em serialização
  ```python
  repl = 'python.exe'
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/command/install_scripts.py:52** - Acesso a atributo de relação em loop
  ```python
  for args in writer.get_args(dist, cmd.as_header()):
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/command/install_scripts.py:43** - Possível acesso a relação em serialização
  ```python
  exec_param = "python.exe"
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/command/install_lib.py:24** - Acesso a atributo de relação em loop
  ```python
  for ns_pkg in self._get_SVEM_NSPs()
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/command/install_lib.py:43** - Possível acesso a relação em serialização
  ```python
  ['foo.bar.baz', 'foo.bar', 'foo']
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/command/install_lib.py:72** - Possível acesso a relação em serialização
  ```python
  yield '__init__.py'
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/command/install_lib.py:74** - Possível acesso a relação em serialização
  ```python
  yield '__init__.pyc'
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/command/install_lib.py:75** - Possível acesso a relação em serialização
  ```python
  yield '__init__.pyo'
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/command/upload_docs.py:47** - Acesso a atributo de relação em loop
  ```python
  for ep in iter_entry_points('distutils.commands', 'build_sphinx'):
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/command/upload_docs.py:47** - Possível acesso a relação em serialização
  ```python
  for ep in iter_entry_points('distutils.commands', 'build_sphinx'):
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/command/build_py.py:80** - Loop com query de relação
  ```python
  for file in self.find_data_files(package, src_dir)
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/command/build_py.py:80** - Acesso a atributo de relação em loop
  ```python
  for file in self.find_data_files(package, src_dir)
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/command/sdist.py:17** - Acesso a atributo de relação em loop
  ```python
  for ep in pkg_resources.iter_entry_points('setuptools.file_finders'):
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/command/sdist.py:17** - Possível acesso a relação em serialização
  ```python
  for ep in pkg_resources.iter_entry_points('setuptools.file_finders'):
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/command/sdist.py:45** - Possível acesso a relação em serialização
  ```python
  self.filelist.append(os.path.join(ei_cmd.egg_info, 'SOURCES.txt'))
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/command/sdist.py:101** - Possível acesso a relação em serialização
  ```python
  if os.path.isfile('pyproject.toml'):
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/command/sdist.py:102** - Possível acesso a relação em serialização
  ```python
  self.filelist.append('pyproject.toml')
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/command/sdist.py:151** - Possível acesso a relação em serialização
  ```python
  dest = os.path.join(base_dir, 'setup.cfg')
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/command/sdist.py:156** - Possível acesso a relação em serialização
  ```python
  self.copy_file('setup.cfg', dest)
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/command/sdist.py:171** - Possível acesso a relação em serialização
  ```python
  """Read the manifest file (named by 'self.manifest') and use it to
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/command/sdist.py:172** - Possível acesso a relação em serialização
  ```python
  fill in 'self.filelist', the list of files to include in the source
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/command/test.py:48** - Loop com query de relação
  ```python
  for file in resource_listdir(module.__name__, ''):
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/command/test.py:48** - Acesso a atributo de relação em loop
  ```python
  for file in resource_listdir(module.__name__, ''):
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/command/test.py:49** - Possível acesso a relação em serialização
  ```python
  if file.endswith('.py') and file != '__init__.py':
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/command/test.py:85** - Possível acesso a relação em serialização
  ```python
  "Run single test, case or suite (e.g. 'module.test_suite')",
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/command/build_clib.py:57** - Acesso a atributo de relação em loop
  ```python
  for source in sources:
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/command/egg_info.py:289** - Acesso a atributo de relação em loop
  ```python
  for ep in iter_entry_points('egg_info.writers'):
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/command/egg_info.py:289** - Possível acesso a relação em serialização
  ```python
  for ep in iter_entry_points('egg_info.writers'):
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/command/egg_info.py:295** - Possível acesso a relação em serialização
  ```python
  nl = os.path.join(self.egg_info, "native_libs.txt")
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/command/egg_info.py:303** - Possível acesso a relação em serialização
  ```python
  manifest_filename = os.path.join(self.egg_info, "SOURCES.txt")
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/command/egg_info.py:526** - Possível acesso a relação em serialização
  ```python
  template = "MANIFEST.in"
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/command/egg_info.py:556** - Possível acesso a relação em serialização
  ```python
  Write the file list in 'self.filelist' to the manifest file
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/command/egg_info.py:557** - Possível acesso a relação em serialização
  ```python
  named by 'self.manifest'.
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/command/egg_info.py:587** - Possível acesso a relação em serialização
  ```python
  if os.path.exists("setup.py"):
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/command/egg_info.py:590** - Possível acesso a relação em serialização
  ```python
  self.filelist.append("setup.py")
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/command/egg_info.py:647** - Possível acesso a relação em serialização
  ```python
  "WARNING: 'depends.txt' is not used by setuptools 0.6!\n"
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/command/install.py:74** - Possível acesso a relação em serialização
  ```python
  'run_command' method in 'distutils.dist', and *its* caller will be
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/command/install.py:92** - Possível acesso a relação em serialização
  ```python
  caller_module == 'distutils.dist'
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/command/develop.py:135** - Acesso a atributo de relação em loop
  ```python
  contents = [line.rstrip() for line in egg_link_file]
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/command/develop.py:178** - Possível acesso a relação em serialização
  ```python
  >>> dist = Distribution(project_name='foo', version='1.0')
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/command/rotate.py:41** - Acesso a atributo de relação em loop
  ```python
  convert_path(p.strip()) for p in self.match.split(',')
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/command/install_egg_info.py:55** - Acesso a atributo de relação em loop
  ```python
  for skip in '.svn/', 'CVS/':
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/command/setopt.py:19** - Possível acesso a relação em serialização
  ```python
  return 'setup.cfg'
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/command/setopt.py:22** - Possível acesso a relação em serialização
  ```python
  os.path.dirname(distutils.__file__), 'distutils.cfg'
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/extern/__init__.py:34** - Acesso a atributo de relação em loop
  ```python
  for prefix in self.search_path:
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/extern/__init__.py:73** - Possível acesso a relação em serialização
  ```python
  VendorImporter(__name__, names, 'setuptools._vendor').install()
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/_msvccompiler.py:46** - Loop com query de relação
  ```python
  for i in count():
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/_msvccompiler.py:46** - Acesso a atributo de relação em loop
  ```python
  for i in count():
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/_msvccompiler.py:76** - Possível acesso a relação em serialização
  ```python
  os.path.join(root, "Microsoft Visual Studio", "Installer", "vswhere.exe"),
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/_msvccompiler.py:110** - Possível acesso a relação em serialização
  ```python
  vcvarsall = os.path.join(best_dir, "vcvarsall.bat")
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/_msvccompiler.py:165** - Possível acesso a relação em serialização
  ```python
  # 'vcvarsall.bat'. Always cross-compile from x86 to work with the
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/_msvccompiler.py:231** - Possível acesso a relação em serialização
  ```python
  self.cc = _find_exe("cl.exe", paths)
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/_msvccompiler.py:232** - Possível acesso a relação em serialização
  ```python
  self.linker = _find_exe("link.exe", paths)
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/_msvccompiler.py:233** - Possível acesso a relação em serialização
  ```python
  self.lib = _find_exe("lib.exe", paths)
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/_msvccompiler.py:234** - Possível acesso a relação em serialização
  ```python
  self.rc = _find_exe("rc.exe", paths)   # resource compiler
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/_msvccompiler.py:235** - Possível acesso a relação em serialização
  ```python
  self.mc = _find_exe("mc.exe", paths)   # message compiler
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/_msvccompiler.py:236** - Possível acesso a relação em serialização
  ```python
  self.mt = _find_exe("mt.exe", paths)   # message compiler
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/_msvccompiler.py:530** - Possível acesso a relação em serialização
  ```python
  with unittest.mock.patch('os.environ', env):
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/unixccompiler.py:303** - Acesso a atributo de relação em loop
  ```python
  for dir in dirs:
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/filelist.py:64** - Acesso a atributo de relação em loop
  ```python
  for sort_tuple in sortable_files:
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/filelist.py:183** - Possível acesso a relação em serialização
  ```python
  """Select strings (presumably filenames) from 'self.files' that
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/filelist.py:191** - Possível acesso a relação em serialização
  ```python
  stringent: "*.py" will match "foo.py" but not "foo/bar.py".  If
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/filelist.py:229** - Possível acesso a relação em serialização
  ```python
  The list 'self.files' is modified in place.
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/ccompiler.py:24** - Loop com query de relação
  ```python
  against, etc. -- are attributes of the compiler instance.  To allow for
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/ccompiler.py:24** - Acesso a atributo de relação em loop
  ```python
  against, etc. -- are attributes of the compiler instance.  To allow for
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/ccompiler.py:104** - Possível acesso a relação em serialização
  ```python
  # (library names, not filenames: eg. "foo" not "libfoo.a")
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/ccompiler.py:365** - Possível acesso a relação em serialização
  ```python
  is None, replaces it with 'self.output_dir'; ensures that 'macros'
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/ccompiler.py:366** - Possível acesso a relação em serialização
  ```python
  is a list, and augments it with 'self.macros'; ensures that
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/ccompiler.py:367** - Possível acesso a relação em serialização
  ```python
  'include_dirs' is a list, and augments it with 'self.include_dirs'.
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/ccompiler.py:431** - Possível acesso a relação em serialização
  ```python
  (eg. 'self.libraries' augments 'libraries').  Return a tuple with
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/ccompiler.py:642** - Possível acesso a relação em serialização
  ```python
  filenames in a platform-specific way (eg. "foo" becomes "libfoo.a"
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/ccompiler.py:643** - Possível acesso a relação em serialização
  ```python
  on Unix and "foo.lib" on DOS/Windows).  However, they can include a
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/ccompiler.py:799** - Possível acesso a relação em serialização
  ```python
  self.link_executable(objects, "a.out",
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/ccompiler.py:805** - Possível acesso a relação em serialização
  ```python
  os.remove("a.out")
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/ccompiler.py:999** - Possível acesso a relação em serialização
  ```python
  platform/compiler combination.  'plat' defaults to 'os.name'
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/msvc9compiler.py:64** - Loop com query de relação
  ```python
  for base in HKEYS:
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/msvc9compiler.py:64** - Acesso a atributo de relação em loop
  ```python
  for base in HKEYS:
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/msvc9compiler.py:52** - Possível acesso a relação em serialização
  ```python
  # 'vcvarsall.bat'.  Note a cross-compile may combine these (eg, 'x86_amd64' is
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/msvc9compiler.py:138** - Possível acesso a relação em serialização
  ```python
  "sdkinstallrootv2.0")
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/msvc9compiler.py:140** - Possível acesso a relação em serialização
  ```python
  raise KeyError("sdkinstallrootv2.0")
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/msvc9compiler.py:246** - Possível acesso a relação em serialização
  ```python
  vcvarsall = os.path.join(productdir, "vcvarsall.bat")
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/msvc9compiler.py:350** - Possível acesso a relação em serialização
  ```python
  if "DISTUTILS_USE_SDK" in os.environ and "MSSdk" in os.environ and self.find_exe("cl.exe"):
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/msvc9compiler.py:353** - Possível acesso a relação em serialização
  ```python
  self.cc = "cl.exe"
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/msvc9compiler.py:354** - Possível acesso a relação em serialização
  ```python
  self.linker = "link.exe"
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/msvc9compiler.py:355** - Possível acesso a relação em serialização
  ```python
  self.lib = "lib.exe"
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/msvc9compiler.py:356** - Possível acesso a relação em serialização
  ```python
  self.rc = "rc.exe"
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/msvc9compiler.py:357** - Possível acesso a relação em serialização
  ```python
  self.mc = "mc.exe"
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/msvc9compiler.py:383** - Possível acesso a relação em serialização
  ```python
  self.cc = self.find_exe("cl.exe")
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/msvc9compiler.py:384** - Possível acesso a relação em serialização
  ```python
  self.linker = self.find_exe("link.exe")
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/msvc9compiler.py:385** - Possível acesso a relação em serialização
  ```python
  self.lib = self.find_exe("lib.exe")
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/msvc9compiler.py:386** - Possível acesso a relação em serialização
  ```python
  self.rc = self.find_exe("rc.exe")   # resource compiler
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/msvc9compiler.py:387** - Possível acesso a relação em serialização
  ```python
  self.mc = self.find_exe("mc.exe")   # message compiler
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/msvc9compiler.py:653** - Possível acesso a relação em serialização
  ```python
  self.spawn(['mt.exe', '-nologo', '-manifest',
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/archive_util.py:175** - Acesso a atributo de relação em loop
  ```python
  for name in dirnames:
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/cmd.py:236** - Acesso a atributo de relação em loop
  ```python
  ok = all(isinstance(v, str) for v in val)
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/cmd.py:69** - Possível acesso a relação em serialização
  ```python
  # value of each flag is a touch complicated -- hence "self._dry_run"
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/cmd.py:78** - Possível acesso a relação em serialização
  ```python
  # Some commands define a 'self.force' option to ignore file
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/cmd.py:80** - Possível acesso a relação em serialização
  ```python
  # 'self.force' exists for all commands.  So define it here
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/cmd.py:379** - Possível acesso a relação em serialização
  ```python
  files listed in 'infiles'.  If the command defined 'self.force',
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/version.py:233** - Possível acesso a relação em serialização
  ```python
  # eg. "0.99" < "0.99pl14" < "1.0", and "5.001" < "5.001m" < "5.002".
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/version.py:233** - Possível acesso a relação em serialização
  ```python
  # eg. "0.99" < "0.99pl14" < "1.0", and "5.001" < "5.001m" < "5.002".
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/version.py:233** - Possível acesso a relação em serialização
  ```python
  # eg. "0.99" < "0.99pl14" < "1.0", and "5.001" < "5.001m" < "5.002".
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/version.py:233** - Possível acesso a relação em serialização
  ```python
  # eg. "0.99" < "0.99pl14" < "1.0", and "5.001" < "5.001m" < "5.002".
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/version.py:233** - Possível acesso a relação em serialização
  ```python
  # eg. "0.99" < "0.99pl14" < "1.0", and "5.001" < "5.001m" < "5.002".
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/version.py:233** - Possível acesso a relação em serialização
  ```python
  # eg. "0.99" < "0.99pl14" < "1.0", and "5.001" < "5.001m" < "5.002".
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/version.py:262** - Possível acesso a relação em serialização
  ```python
  # "1.2a2" and "1.2".  That's not because the *code* is doing anything
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/version.py:262** - Possível acesso a relação em serialização
  ```python
  # "1.2a2" and "1.2".  That's not because the *code* is doing anything
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/util.py:163** - Acesso a atributo de relação em loop
  ```python
  return [int(n) for n in s.split('.')]
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/util.py:37** - Possível acesso a relação em serialização
  ```python
  For other non-POSIX platforms, currently just returns 'sys.platform'.
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/util.py:218** - Possível acesso a relação em serialização
  ```python
  """Ensure that 'os.environ' has all the environment variables we
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/util.py:248** - Possível acesso a relação em serialização
  ```python
  dictionary, or in 'os.environ' if it's not in 'local_vars'.
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/util.py:249** - Possível acesso a relação em serialização
  ```python
  'os.environ' is first checked/augmented to guarantee that it contains
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/util.py:251** - Possível acesso a relação em serialização
  ```python
  variables not found in either 'local_vars' or 'os.environ'.
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/fancy_getopt.py:83** - Loop com query de relação
  ```python
  for option in self.option_table:
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/fancy_getopt.py:83** - Acesso a atributo de relação em loop
  ```python
  for option in self.option_table:
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/versionpredicate.py:116** - Acesso a atributo de relação em loop
  ```python
  self.pred = [splitUp(aPred) for aPred in str.split(",")]
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/versionpredicate.py:39** - Possível acesso a relação em serialização
  ```python
  'pyepat.abc'
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/versionpredicate.py:51** - Possível acesso a relação em serialização
  ```python
  >>> v.satisfied_by('1.1')
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/versionpredicate.py:53** - Possível acesso a relação em serialização
  ```python
  >>> v.satisfied_by('1.4')
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/versionpredicate.py:55** - Possível acesso a relação em serialização
  ```python
  >>> v.satisfied_by('1.0')
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/versionpredicate.py:57** - Possível acesso a relação em serialização
  ```python
  >>> v.satisfied_by('4444.4')
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/versionpredicate.py:59** - Possível acesso a relação em serialização
  ```python
  >>> v.satisfied_by('1555.1b3')
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/versionpredicate.py:67** - Possível acesso a relação em serialização
  ```python
  >>> v.satisfied_by('0.1')
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/versionpredicate.py:69** - Possível acesso a relação em serialização
  ```python
  >>> v.satisfied_by('0.2')
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/versionpredicate.py:78** - Possível acesso a relação em serialização
  ```python
  ValueError: invalid version number '1.2zb3'
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/versionpredicate.py:152** - Possível acesso a relação em serialização
  ```python
  ('mypkg', StrictVersion ('1.2'))
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/core.py:78** - Possível acesso a relação em serialização
  ```python
  'distutils.fancy_getopt'.  Any command-line options between the current
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/cygwinccompiler.py:217** - Acesso a atributo de relação em loop
  ```python
  for sym in export_symbols:
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/cygwinccompiler.py:125** - Possível acesso a relação em serialização
  ```python
  # ld_version >= "2.10.90" and < "2.13" should also be able to use
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/cygwinccompiler.py:135** - Possível acesso a relação em serialização
  ```python
  # ld_version >= "2.13" support -shared so use it instead of
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/cygwinccompiler.py:137** - Possível acesso a relação em serialização
  ```python
  if self.ld_version >= "2.13":
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/cygwinccompiler.py:289** - Possível acesso a relação em serialização
  ```python
  # ld_version >= "2.13" support -shared so use it instead of
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/cygwinccompiler.py:291** - Possível acesso a relação em serialização
  ```python
  if ('gcc' in self.cc and self.ld_version < "2.13"):
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/cygwinccompiler.py:346** - Possível acesso a relação em serialização
  ```python
  Note there are two ways to conclude "OK": either 'sys.version' contains
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/cygwinccompiler.py:348** - Possível acesso a relação em serialização
  ```python
  installed "pyconfig.h" contains the string "__GNUC__".
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/cygwinccompiler.py:352** - Possível acesso a relação em serialização
  ```python
  # "pyconfig.h" check -- should probably be renamed...
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/extension.py:106** - Acesso a atributo de relação em loop
  ```python
  all(isinstance(v, str) for v in sources)):
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/extension.py:12** - Possível acesso a relação em serialização
  ```python
  # complex to simplify some common cases ("foo" module in "foo.c") and do
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/extension.py:13** - Possível acesso a relação em serialização
  ```python
  # better error-checking ("foo.c" actually exists).
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/spawn.py:101** - Acesso a atributo de relação em loop
  ```python
  for p in paths:
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/spawn.py:75** - Possível acesso a relação em serialização
  ```python
  A string listing directories separated by 'os.pathsep'; defaults to
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/text_file.py:88** - Acesso a atributo de relação em loop
  ```python
  for opt in self.default_options.keys():
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/msvccompiler.py:108** - Acesso a atributo de relação em loop
  ```python
  for base in HKEYS:
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/msvccompiler.py:122** - Possível acesso a relação em serialização
  ```python
  self.set_macro("FrameworkSDKDir", net, "sdkinstallrootv1.1")
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/msvccompiler.py:250** - Possível acesso a relação em serialização
  ```python
  if "DISTUTILS_USE_SDK" in os.environ and "MSSdk" in os.environ and self.find_exe("cl.exe"):
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/msvccompiler.py:253** - Possível acesso a relação em serialização
  ```python
  self.cc = "cl.exe"
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/msvccompiler.py:254** - Possível acesso a relação em serialização
  ```python
  self.linker = "link.exe"
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/msvccompiler.py:255** - Possível acesso a relação em serialização
  ```python
  self.lib = "lib.exe"
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/msvccompiler.py:256** - Possível acesso a relação em serialização
  ```python
  self.rc = "rc.exe"
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/msvccompiler.py:257** - Possível acesso a relação em serialização
  ```python
  self.mc = "mc.exe"
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/msvccompiler.py:267** - Possível acesso a relação em serialização
  ```python
  self.cc = self.find_exe("cl.exe")
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/msvccompiler.py:268** - Possível acesso a relação em serialização
  ```python
  self.linker = self.find_exe("link.exe")
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/msvccompiler.py:269** - Possível acesso a relação em serialização
  ```python
  self.lib = self.find_exe("lib.exe")
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/msvccompiler.py:270** - Possível acesso a relação em serialização
  ```python
  self.rc = self.find_exe("rc.exe")   # resource compiler
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/msvccompiler.py:271** - Possível acesso a relação em serialização
  ```python
  self.mc = self.find_exe("mc.exe")   # message compiler
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/dep_util.py:44** - Acesso a atributo de relação em loop
  ```python
  for i in range(len(sources)):
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/dir_util.py:57** - Acesso a atributo de relação em loop
  ```python
  for d in tails:
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/sysconfig.py:45** - Loop com query de relação
  ```python
  for fn in ("Setup", "Setup.local"):
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/sysconfig.py:45** - Acesso a atributo de relação em loop
  ```python
  for fn in ("Setup", "Setup.local"):
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/sysconfig.py:45** - Possível acesso a relação em serialização
  ```python
  for fn in ("Setup", "Setup.local"):
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/sysconfig.py:83** - Possível acesso a relação em serialização
  ```python
  leaving off the patchlevel.  Sample return values could be '1.5'
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/sysconfig.py:84** - Possível acesso a relação em serialização
  ```python
  or '2.2'.
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/sysconfig.py:268** - Possível acesso a relação em serialização
  ```python
  return os.path.join(inc_dir, 'pyconfig.h')
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/dist.py:130** - Loop com query de relação
  ```python
  display_option_names = [translate_longopt(x[0]) for x in display_options]
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/dist.py:130** - Acesso a atributo de relação em loop
  ```python
  display_option_names = [translate_longopt(x[0]) for x in display_options]
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/dist.py:356** - Possível acesso a relação em serialização
  ```python
  sys_file = os.path.join(sys_dir, "distutils.cfg")
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/dist.py:364** - Possível acesso a relação em serialização
  ```python
  user_filename = "pydistutils.cfg"
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/dist.py:373** - Possível acesso a relação em serialização
  ```python
  local_file = "setup.cfg"
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/dist.py:803** - Possível acesso a relação em serialização
  ```python
  if "distutils.command" not in pkgs:
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/dist.py:804** - Possível acesso a relação em serialização
  ```python
  pkgs.insert(0, "distutils.command")
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/dist.py:880** - Possível acesso a relação em serialização
  ```python
  (from 'self.command_options').
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/dist.py:1104** - Possível acesso a relação em serialização
  ```python
  if metadata_version == '1.1':
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/dist.py:1123** - Possível acesso a relação em serialização
  ```python
  version = '1.0'
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/dist.py:1126** - Possível acesso a relação em serialização
  ```python
  version = '1.1'
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/bcppcompiler.py:95** - Acesso a atributo de relação em loop
  ```python
  for obj in objects:
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/bcppcompiler.py:64** - Possível acesso a relação em serialização
  ```python
  self.cc = "bcc32.exe"
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/bcppcompiler.py:65** - Possível acesso a relação em serialização
  ```python
  self.linker = "ilink32.exe"
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/bcppcompiler.py:66** - Possível acesso a relação em serialização
  ```python
  self.lib = "tlib.exe"
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/bcppcompiler.py:372** - Possível acesso a relação em serialização
  ```python
  pp_args = ['cpp32.exe'] + pp_opts
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/build.py:134** - Acesso a atributo de relação em loop
  ```python
  for cmd_name in self.get_sub_commands():
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/build_ext.py:250** - Acesso a atributo de relação em loop
  ```python
  self.define = [(symbol, '1') for symbol in defines]
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/build_ext.py:282** - Possível acesso a relação em serialização
  ```python
  # 'self.extensions', as supplied by setup.py, is a list of
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/build_ext.py:628** - Possível acesso a relação em serialização
  ```python
  for vers in ("1.3", "1.2", "1.1"):
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/build_ext.py:628** - Possível acesso a relação em serialização
  ```python
  for vers in ("1.3", "1.2", "1.1"):
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/build_ext.py:628** - Possível acesso a relação em serialização
  ```python
  for vers in ("1.3", "1.2", "1.1"):
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/build_ext.py:629** - Possível acesso a relação em serialização
  ```python
  fn = os.path.join("c:\\swig%s" % vers, "swig.exe")
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/build_ext.py:633** - Possível acesso a relação em serialização
  ```python
  return "swig.exe"
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/build_ext.py:678** - Possível acesso a relação em serialização
  ```python
  r"""Convert the name of an extension (eg. "foo.bar") into the name
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/build_ext.py:689** - Possível acesso a relação em serialização
  ```python
  export.  This either uses 'ext.export_symbols' or, if it's not
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/build_ext.py:710** - Possível acesso a relação em serialização
  ```python
  shared extension.  On most platforms, this is just 'ext.libraries';
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/config.py:111** - Acesso a atributo de relação em loop
  ```python
  for header in headers:
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/config.py:90** - Possível acesso a relação em serialização
  ```python
  """Check that 'self.compiler' really is a CCompiler object;
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/config.py:121** - Possível acesso a relação em serialização
  ```python
  out = "_configtest.i"
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/clean.py:60** - Acesso a atributo de relação em loop
  ```python
  for directory in (self.build_lib,
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/check.py:93** - Acesso a atributo de relação em loop
  ```python
  for attr in ('name', 'version', 'url'):
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/check.py:126** - Possível acesso a relação em serialização
  ```python
  source_path = self.distribution.script_name or 'setup.py'
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/install_scripts.py:48** - Acesso a atributo de relação em loop
  ```python
  for file in self.get_outputs():
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/upload.py:117** - Possível acesso a relação em serialização
  ```python
  'metadata_version': '1.0',
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/register.py:48** - Acesso a atributo de relação em loop
  ```python
  for cmd_name in self.get_sub_commands():
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/register.py:227** - Possível acesso a relação em serialização
  ```python
  'metadata_version' : '1.0',
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/register.py:246** - Possível acesso a relação em serialização
  ```python
  data['metadata_version'] = '1.1'
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/bdist_wininst.py:115** - Acesso a atributo de relação em loop
  ```python
  for script in self.distribution.scripts:
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/bdist_wininst.py:333** - Possível acesso a relação em serialização
  ```python
  if self.target_version < "2.4":
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/bdist_wininst.py:334** - Possível acesso a relação em serialização
  ```python
  bv = '6.0'
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/bdist_wininst.py:335** - Possível acesso a relação em serialização
  ```python
  elif self.target_version == "2.4":
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/bdist_wininst.py:336** - Possível acesso a relação em serialização
  ```python
  bv = '7.1'
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/bdist_wininst.py:337** - Possível acesso a relação em serialização
  ```python
  elif self.target_version == "2.5":
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/bdist_wininst.py:338** - Possível acesso a relação em serialização
  ```python
  bv = '8.0'
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/bdist_wininst.py:339** - Possível acesso a relação em serialização
  ```python
  elif self.target_version <= "3.2":
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/bdist_wininst.py:340** - Possível acesso a relação em serialização
  ```python
  bv = '9.0'
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/bdist_wininst.py:341** - Possível acesso a relação em serialização
  ```python
  elif self.target_version <= "3.4":
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/bdist_wininst.py:342** - Possível acesso a relação em serialização
  ```python
  bv = '10.0'
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/bdist_wininst.py:344** - Possível acesso a relação em serialização
  ```python
  bv = '14.0'
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/bdist_wininst.py:351** - Possível acesso a relação em serialização
  ```python
  bv = '14.0'
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/bdist_wininst.py:354** - Possível acesso a relação em serialização
  ```python
  # the first field, so assume 'x.0' until proven otherwise
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/install_headers.py:39** - Acesso a atributo de relação em loop
  ```python
  for header in headers:
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/install_lib.py:153** - Acesso a atributo de relação em loop
  ```python
  for file in build_files:
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/build_py.py:102** - Loop com query de relação
  ```python
  for package in self.packages:
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/build_py.py:102** - Acesso a atributo de relação em loop
  ```python
  for package in self.packages:
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/build_py.py:199** - Possível acesso a relação em serialização
  ```python
  init_py = os.path.join(package_dir, "__init__.py")
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/build_py.py:234** - Possível acesso a relação em serialização
  ```python
  module name in 'self.py_modules'.  Returns a list of tuples (package,
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/build_py.py:286** - Possível acesso a relação em serialização
  ```python
  they are specified one-module-at-a-time ('self.py_modules') or
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/build_py.py:287** - Possível acesso a relação em serialização
  ```python
  by whole packages ('self.packages').  Return a list of tuples
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/sdist.py:28** - Acesso a atributo de relação em loop
  ```python
  for format in ARCHIVE_FORMATS.keys():
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/sdist.py:99** - Possível acesso a relação em serialização
  ```python
  READMES = ('README', 'README.txt', 'README.rst')
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/sdist.py:99** - Possível acesso a relação em serialização
  ```python
  READMES = ('README', 'README.txt', 'README.rst')
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/sdist.py:128** - Possível acesso a relação em serialização
  ```python
  self.template = "MANIFEST.in"
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/sdist.py:151** - Possível acesso a relação em serialização
  ```python
  # whatever).  File list is accumulated in 'self.filelist'.
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/sdist.py:172** - Possível acesso a relação em serialização
  ```python
  distribution, and put it in 'self.filelist'.  This might involve
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/sdist.py:271** - Possível acesso a relação em serialização
  ```python
  optional = ['test/test*.py', 'setup.cfg']
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/sdist.py:327** - Possível acesso a relação em serialização
  ```python
  (usually "MANIFEST.in") The parsing and processing is done by
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/sdist.py:328** - Possível acesso a relação em serialização
  ```python
  'self.filelist', which updates itself accordingly.
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/sdist.py:378** - Possível acesso a relação em serialização
  ```python
  """Write the file list in 'self.filelist' (presumably as filled in
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/sdist.py:380** - Possível acesso a relação em serialização
  ```python
  named by 'self.manifest'.
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/sdist.py:405** - Possível acesso a relação em serialização
  ```python
  """Read the manifest file (named by 'self.manifest') and use it to
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/sdist.py:406** - Possível acesso a relação em serialização
  ```python
  fill in 'self.filelist', the list of files to include in the source
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/sdist.py:463** - Possível acesso a relação em serialização
  ```python
  archive files (according to 'self.formats') from the release tree.
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/sdist.py:465** - Possível acesso a relação em serialização
  ```python
  'self.keep_temp' is true).  The list of archive files created is
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/bdist.py:17** - Acesso a atributo de relação em loop
  ```python
  for format in bdist.format_commands:
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/build_scripts.py:62** - Acesso a atributo de relação em loop
  ```python
  for script in self.scripts:
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/build_scripts.py:54** - Possível acesso a relação em serialização
  ```python
  r"""Copy each script listed in 'self.scripts'; if it's marked as a
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/bdist_rpm.py:219** - Acesso a atributo de relação em loop
  ```python
  for readme in ('README', 'README.txt'):
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/bdist_rpm.py:219** - Possível acesso a relação em serialização
  ```python
  for readme in ('README', 'README.txt'):
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/build_clib.py:112** - Acesso a atributo de relação em loop
  ```python
  for macro in self.undef:
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/build_clib.py:90** - Possível acesso a relação em serialização
  ```python
  # XXX same as for build_ext -- what about 'self.define' and
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/build_clib.py:91** - Possível acesso a relação em serialização
  ```python
  # 'self.undef' ?
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/install.py:394** - Acesso a atributo de relação em loop
  ```python
  for opt in self.user_options:
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/bdist_msi.py:177** - Acesso a atributo de relação em loop
  ```python
  for script in self.distribution.scripts:
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/bdist_msi.py:121** - Possível acesso a relação em serialização
  ```python
  all_versions = ['2.0', '2.1', '2.2', '2.3', '2.4',
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/bdist_msi.py:121** - Possível acesso a relação em serialização
  ```python
  all_versions = ['2.0', '2.1', '2.2', '2.3', '2.4',
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/bdist_msi.py:121** - Possível acesso a relação em serialização
  ```python
  all_versions = ['2.0', '2.1', '2.2', '2.3', '2.4',
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/bdist_msi.py:121** - Possível acesso a relação em serialização
  ```python
  all_versions = ['2.0', '2.1', '2.2', '2.3', '2.4',
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/bdist_msi.py:121** - Possível acesso a relação em serialização
  ```python
  all_versions = ['2.0', '2.1', '2.2', '2.3', '2.4',
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/bdist_msi.py:122** - Possível acesso a relação em serialização
  ```python
  '2.5', '2.6', '2.7', '2.8', '2.9',
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/bdist_msi.py:122** - Possível acesso a relação em serialização
  ```python
  '2.5', '2.6', '2.7', '2.8', '2.9',
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/bdist_msi.py:122** - Possível acesso a relação em serialização
  ```python
  '2.5', '2.6', '2.7', '2.8', '2.9',
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/bdist_msi.py:122** - Possível acesso a relação em serialização
  ```python
  '2.5', '2.6', '2.7', '2.8', '2.9',
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/bdist_msi.py:122** - Possível acesso a relação em serialização
  ```python
  '2.5', '2.6', '2.7', '2.8', '2.9',
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/bdist_msi.py:123** - Possível acesso a relação em serialização
  ```python
  '3.0', '3.1', '3.2', '3.3', '3.4',
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/bdist_msi.py:123** - Possível acesso a relação em serialização
  ```python
  '3.0', '3.1', '3.2', '3.3', '3.4',
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/bdist_msi.py:123** - Possível acesso a relação em serialização
  ```python
  '3.0', '3.1', '3.2', '3.3', '3.4',
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/bdist_msi.py:123** - Possível acesso a relação em serialização
  ```python
  '3.0', '3.1', '3.2', '3.3', '3.4',
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/bdist_msi.py:123** - Possível acesso a relação em serialização
  ```python
  '3.0', '3.1', '3.2', '3.3', '3.4',
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/bdist_msi.py:124** - Possível acesso a relação em serialização
  ```python
  '3.5', '3.6', '3.7', '3.8', '3.9']
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/bdist_msi.py:124** - Possível acesso a relação em serialização
  ```python
  '3.5', '3.6', '3.7', '3.8', '3.9']
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/bdist_msi.py:124** - Possível acesso a relação em serialização
  ```python
  '3.5', '3.6', '3.7', '3.8', '3.9']
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/bdist_msi.py:124** - Possível acesso a relação em serialização
  ```python
  '3.5', '3.6', '3.7', '3.8', '3.9']
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/bdist_msi.py:124** - Possível acesso a relação em serialização
  ```python
  '3.5', '3.6', '3.7', '3.8', '3.9']
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/bdist_msi.py:400** - Possível acesso a relação em serialização
  ```python
  scriptfn = os.path.join(self.bdist_dir, "preinstall.bat")
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/bdist_msi.py:536** - Possível acesso a relação em serialização
  ```python
  #error.control("ErrorIcon", "Icon", 15, 9, 24, 24, 5242881, None, "py.ico", None, None)
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/bdist_msi.py:552** - Possível acesso a relação em serialização
  ```python
  #               "py.ico", None, None)
  ```

- **apps/api/venv/lib/python3.9/site-packages/setuptools/_distutils/command/install_data.py:44** - Acesso a atributo de relação em loop
  ```python
  for f in self.data_files:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pkg_resources/__init__.py:551** - Loop com query de relação
  ```python
  for entry in entries:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pkg_resources/__init__.py:551** - Acesso a atributo de relação em loop
  ```python
  for entry in entries:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pkg_resources/__init__.py:427** - Possível acesso a relação em serialização
  ```python
  if dversion == 7 and macosversion >= "10.3" or \
  ```

- **apps/api/venv/lib/python3.9/site-packages/pkg_resources/__init__.py:428** - Possível acesso a relação em serialização
  ```python
  dversion == 8 and macosversion >= "10.4":
  ```

- **apps/api/venv/lib/python3.9/site-packages/pkg_resources/__init__.py:700** - Possível acesso a relação em serialização
  ```python
  # FIXME: 'WorkingSet.resolve' is too complex (11)
  ```

- **apps/api/venv/lib/python3.9/site-packages/pkg_resources/__init__.py:960** - Possível acesso a relação em serialização
  ```python
  optional string naming the desired version of Python (e.g. ``'3.6'``);
  ```

- **apps/api/venv/lib/python3.9/site-packages/pkg_resources/__init__.py:1750** - Possível acesso a relação em serialização
  ```python
  # FIXME: 'ZipProvider._extract_resource' is too complex (12)
  ```

- **apps/api/venv/lib/python3.9/site-packages/pkg_resources/__init__.py:1764** - Possível acesso a relação em serialização
  ```python
  raise IOError('"os.rename" and "os.unlink" are not supported '
  ```

- **apps/api/venv/lib/python3.9/site-packages/pkg_resources/__init__.py:1764** - Possível acesso a relação em serialização
  ```python
  raise IOError('"os.rename" and "os.unlink" are not supported '
  ```

- **apps/api/venv/lib/python3.9/site-packages/pkg_resources/__init__.py:1825** - Possível acesso a relação em serialização
  ```python
  for name in ('native_libs.txt', 'eager_resources.txt'):
  ```

- **apps/api/venv/lib/python3.9/site-packages/pkg_resources/__init__.py:1825** - Possível acesso a relação em serialização
  ```python
  for name in ('native_libs.txt', 'eager_resources.txt'):
  ```

- **apps/api/venv/lib/python3.9/site-packages/pkg_resources/__init__.py:2727** - Possível acesso a relação em serialização
  ```python
  for name in 'requires.txt', 'depends.txt':
  ```

- **apps/api/venv/lib/python3.9/site-packages/pkg_resources/__init__.py:2727** - Possível acesso a relação em serialização
  ```python
  for name in 'requires.txt', 'depends.txt':
  ```

- **apps/api/venv/lib/python3.9/site-packages/pkg_resources/__init__.py:2781** - Possível acesso a relação em serialização
  ```python
  for pkg in self._get_metadata('namespace_packages.txt'):
  ```

- **apps/api/venv/lib/python3.9/site-packages/pkg_resources/__init__.py:2854** - Possível acesso a relação em serialização
  ```python
  self._get_metadata('entry_points.txt'), self
  ```

- **apps/api/venv/lib/python3.9/site-packages/pkg_resources/__init__.py:2864** - Possível acesso a relação em serialização
  ```python
  # FIXME: 'Distribution.insert_on' is too complex (13)
  ```

- **apps/api/venv/lib/python3.9/site-packages/pkg_resources/__init__.py:2938** - Possível acesso a relação em serialização
  ```python
  nsp = dict.fromkeys(self._get_metadata('namespace_packages.txt'))
  ```

- **apps/api/venv/lib/python3.9/site-packages/pkg_resources/__init__.py:2940** - Possível acesso a relação em serialização
  ```python
  for modname in self._get_metadata('top_level.txt'):
  ```

- **apps/api/venv/lib/python3.9/site-packages/pkg_resources/__init__.py:3170** - Possível acesso a relação em serialização
  ```python
  raise IOError('"os.mkdir" not supported on this platform.')
  ```

- **apps/api/venv/lib/python3.9/site-packages/pkg_resources/_vendor/appdirs.py:149** - Acesso a atributo de relação em loop
  ```python
  pathlist = [os.path.expanduser(x.rstrip(os.sep)) for x in path.split(os.pathsep)]
  ```

- **apps/api/venv/lib/python3.9/site-packages/pkg_resources/_vendor/appdirs.py:591** - Possível acesso a relação em serialização
  ```python
  dirs = AppDirs(appname, appauthor, version="1.0")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pkg_resources/_vendor/pyparsing.py:177** - Loop com query de relação
  ```python
  for fname in "sum len sorted reversed list tuple set any all min max".split():
  ```

- **apps/api/venv/lib/python3.9/site-packages/pkg_resources/_vendor/pyparsing.py:177** - Acesso a atributo de relação em loop
  ```python
  for fname in "sum len sorted reversed list tuple set any all min max".split():
  ```

- **apps/api/venv/lib/python3.9/site-packages/pkg_resources/_vendor/pyparsing.py:347** - Possível acesso a relação em serialização
  ```python
  test("result.day")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pkg_resources/_vendor/pyparsing.py:712** - Possível acesso a relação em serialização
  ```python
  print(type(result), result) # -> <class 'pyparsing.ParseResults'> ['sldkj', 'lsdkj', 'sldkj']
  ```

- **apps/api/venv/lib/python3.9/site-packages/pkg_resources/_vendor/pyparsing.py:729** - Possível acesso a relação em serialização
  ```python
  print(type(result), repr(result)) # -> <class 'pyparsing.ParseResults'> (['12', '/', '31', '/', '1999'], {'day': [('1999', 4)], 'year': [('12', 0)], 'month': [('31', 2)]})
  ```

- **apps/api/venv/lib/python3.9/site-packages/pkg_resources/_vendor/pyparsing.py:3456** - Possível acesso a relação em serialização
  ```python
  [['123'], ['3.1416'], ['789']]
  ```

- **apps/api/venv/lib/python3.9/site-packages/pkg_resources/_vendor/pyparsing.py:3538** - Possível acesso a relação em serialização
  ```python
  print(number.searchString("123 3.1416 789")) #  Better -> [['123'], ['3.1416'], ['789']]
  ```

- **apps/api/venv/lib/python3.9/site-packages/pkg_resources/_vendor/pyparsing.py:4242** - Possível acesso a relação em serialização
  ```python
  print(real.parseString('3.1416')) # -> ['3', '.', '1416']
  ```

- **apps/api/venv/lib/python3.9/site-packages/pkg_resources/_vendor/pyparsing.py:4247** - Possível acesso a relação em serialização
  ```python
  print(real.parseString('3.1416')) # -> ['3.1416']
  ```

- **apps/api/venv/lib/python3.9/site-packages/pkg_resources/_vendor/pyparsing.py:4247** - Possível acesso a relação em serialização
  ```python
  print(real.parseString('3.1416')) # -> ['3.1416']
  ```

- **apps/api/venv/lib/python3.9/site-packages/pkg_resources/_vendor/packaging/tags.py:14** - Acesso a atributo de relação em loop
  ```python
  EXTENSION_SUFFIXES = [x[0] for x in imp.get_suffixes()]
  ```

- **apps/api/venv/lib/python3.9/site-packages/pkg_resources/_vendor/packaging/tags.py:184** - Possível acesso a relação em serialização
  ```python
  has_ext = "_d.pyd" in EXTENSION_SUFFIXES
  ```

- **apps/api/venv/lib/python3.9/site-packages/pkg_resources/_vendor/packaging/tags.py:486** - Possível acesso a relação em serialização
  ```python
  # Call gnu_get_libc_version, which returns a string like "2.5"
  ```

- **apps/api/venv/lib/python3.9/site-packages/pkg_resources/_vendor/packaging/version.py:189** - Acesso a atributo de relação em loop
  ```python
  for part in _legacy_version_component_re.split(s):
  ```

- **apps/api/venv/lib/python3.9/site-packages/pkg_resources/_vendor/packaging/markers.py:149** - Acesso a atributo de relação em loop
  ```python
  return [_coerce_parse_result(i) for i in results]
  ```

- **apps/api/venv/lib/python3.9/site-packages/pkg_resources/_vendor/packaging/markers.py:101** - Possível acesso a relação em serialização
  ```python
  | L("os.name")  # PEP-345
  ```

- **apps/api/venv/lib/python3.9/site-packages/pkg_resources/_vendor/packaging/markers.py:102** - Possível acesso a relação em serialização
  ```python
  | L("sys.platform")  # PEP-345
  ```

- **apps/api/venv/lib/python3.9/site-packages/pkg_resources/_vendor/packaging/markers.py:103** - Possível acesso a relação em serialização
  ```python
  | L("platform.version")  # PEP-345
  ```

- **apps/api/venv/lib/python3.9/site-packages/pkg_resources/_vendor/packaging/markers.py:104** - Possível acesso a relação em serialização
  ```python
  | L("platform.machine")  # PEP-345
  ```

- **apps/api/venv/lib/python3.9/site-packages/pkg_resources/_vendor/packaging/markers.py:105** - Possível acesso a relação em serialização
  ```python
  | L("platform.python_implementation")  # PEP-345
  ```

- **apps/api/venv/lib/python3.9/site-packages/pkg_resources/_vendor/packaging/markers.py:110** - Possível acesso a relação em serialização
  ```python
  "os.name": "os_name",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pkg_resources/_vendor/packaging/markers.py:111** - Possível acesso a relação em serialização
  ```python
  "sys.platform": "sys_platform",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pkg_resources/_vendor/packaging/markers.py:112** - Possível acesso a relação em serialização
  ```python
  "platform.version": "platform_version",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pkg_resources/_vendor/packaging/markers.py:113** - Possível acesso a relação em serialização
  ```python
  "platform.machine": "platform_machine",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pkg_resources/_vendor/packaging/markers.py:114** - Possível acesso a relação em serialização
  ```python
  "platform.python_implementation": "platform_python_implementation",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pkg_resources/_vendor/packaging/__about__.py:21** - Possível acesso a relação em serialização
  ```python
  __version__ = "20.4"
  ```

- **apps/api/venv/lib/python3.9/site-packages/pkg_resources/_vendor/packaging/specifiers.py:238** - Acesso a atributo de relação em loop
  ```python
  for version in iterable:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pkg_resources/_vendor/packaging/specifiers.py:214** - Possível acesso a relação em serialização
  ```python
  # a shortcut for ``"2.0" in Specifier(">=2")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pkg_resources/tests/data/my-test-package-source/setup.py:4** - Possível acesso a relação em serialização
  ```python
  version="1.0",
  ```

- **apps/api/venv/lib/python3.9/site-packages/pkg_resources/extern/__init__.py:34** - Acesso a atributo de relação em loop
  ```python
  for prefix in self.search_path:
  ```

- **apps/api/venv/lib/python3.9/site-packages/_distutils_hack/__init__.py:36** - Loop com query de relação
  ```python
  mods = [name for name in sys.modules if re.match(r'distutils\b', name)]
  ```

- **apps/api/venv/lib/python3.9/site-packages/_distutils_hack/__init__.py:36** - Acesso a atributo de relação em loop
  ```python
  mods = [name for name in sys.modules if re.match(r'distutils\b', name)]
  ```

- **apps/api/venv/lib/python3.9/site-packages/_distutils_hack/__init__.py:51** - Possível acesso a relação em serialização
  ```python
  distutils = importlib.import_module('setuptools._distutils')
  ```

- **apps/api/venv/lib/python3.9/site-packages/_distutils_hack/__init__.py:56** - Possível acesso a relação em serialização
  ```python
  core = importlib.import_module('distutils.core')
  ```

- **apps/api/venv/lib/python3.9/site-packages/_distutils_hack/__init__.py:88** - Possível acesso a relação em serialização
  ```python
  return importlib.import_module('setuptools._distutils')
  ```

- **apps/api/venv/lib/python3.9/site-packages/_distutils_hack/__init__.py:112** - Possível acesso a relação em serialização
  ```python
  frame.f_globals['__file__'].endswith('setup.py')
  ```

- **apps/api/venv/lib/python3.9/site-packages/psycopg2/extras.py:155** - Acesso a atributo de relação em loop
  ```python
  for i in range(len(self.description)):
  ```

- **apps/api/venv/lib/python3.9/site-packages/psycopg2/_range.py:166** - Acesso a atributo de relação em loop
  ```python
  for attr in ('_lower', '_upper', '_bounds'):
  ```

- **apps/api/venv/lib/python3.9/site-packages/psycopg2/sql.py:106** - Acesso a atributo de relação em loop
  ```python
  for i in seq:
  ```

- **apps/api/venv/lib/python3.9/site-packages/psycopg2/pool.py:58** - Loop com query de relação
  ```python
  for i in range(self.minconn):
  ```

- **apps/api/venv/lib/python3.9/site-packages/psycopg2/pool.py:58** - Acesso a atributo de relação em loop
  ```python
  for i in range(self.minconn):
  ```

- **apps/api/venv/lib/python3.9/site-packages/flask_marshmallow/fields.py:131** - Acesso a atributo de relação em loop
  ```python
  return [_rapply(each, func, *args, **kwargs) for each in d]
  ```

- **apps/api/venv/lib/python3.9/site-packages/flask_marshmallow/__init__.py:43** - Acesso a atributo de relação em loop
  ```python
  for attr in base_fields.__all__:
  ```

- **apps/api/venv/lib/python3.9/site-packages/flask_marshmallow/__init__.py:66** - Schema sem otimização de campos
  ```python
  class BookSchema(ma.Schema):
  ```

- **apps/api/venv/lib/python3.9/site-packages/itsdangerous/signer.py:73** - Acesso a atributo de relação em loop
  ```python
  return [want_bytes(s) for s in secret_key]  # pyright: ignore
  ```

- **apps/api/venv/lib/python3.9/site-packages/itsdangerous/signer.py:132** - Possível acesso a relação em serialização
  ```python
  salt: str | bytes | None = b"itsdangerous.Signer",
  ```

- **apps/api/venv/lib/python3.9/site-packages/itsdangerous/signer.py:156** - Possível acesso a relação em serialização
  ```python
  salt = b"itsdangerous.Signer"
  ```

- **apps/api/venv/lib/python3.9/site-packages/iniconfig/__init__.py:101** - Loop com query de relação
  ```python
  for name in self:
  ```

- **apps/api/venv/lib/python3.9/site-packages/iniconfig/__init__.py:101** - Acesso a atributo de relação em loop
  ```python
  for name in self:
  ```

- **apps/api/venv/lib/python3.9/site-packages/black/files.py:62** - Loop com query de relação
  ```python
  srcs = tuple(stdin_filename if s == "-" else s for s in srcs)
  ```

- **apps/api/venv/lib/python3.9/site-packages/black/files.py:62** - Acesso a atributo de relação em loop
  ```python
  srcs = tuple(stdin_filename if s == "-" else s for s in srcs)
  ```

- **apps/api/venv/lib/python3.9/site-packages/black/files.py:86** - Possível acesso a relação em serialização
  ```python
  if (directory / "pyproject.toml").is_file():
  ```

- **apps/api/venv/lib/python3.9/site-packages/black/files.py:87** - Possível acesso a relação em serialização
  ```python
  return directory, "pyproject.toml"
  ```

- **apps/api/venv/lib/python3.9/site-packages/black/files.py:97** - Possível acesso a relação em serialização
  ```python
  path_pyproject_toml = path_project_root / "pyproject.toml"
  ```

- **apps/api/venv/lib/python3.9/site-packages/black/files.py:159** - Possível acesso a relação em serialização
  ```python
  """Parse a version string (i.e. ``"3.7"``) to a list of TargetVersion.
  ```

- **apps/api/venv/lib/python3.9/site-packages/black/files.py:396** - Possível acesso a relação em serialização
  ```python
  ) -> Union[io.TextIOWrapper, "colorama.AnsiToWin32"]:
  ```

- **apps/api/venv/lib/python3.9/site-packages/black/parsing.py:45** - Acesso a atributo de relação em loop
  ```python
  if any(Feature.PATTERN_MATCHING in VERSION_TO_FEATURES[v] for v in target_versions):
  ```

- **apps/api/venv/lib/python3.9/site-packages/black/handle_ipynb_magics.py:280** - Acesso a atributo de relação em loop
  ```python
  for replacement in replacements:
  ```

- **apps/api/venv/lib/python3.9/site-packages/black/concurrency.py:44** - Loop com query de relação
  ```python
  for task in tasks:
  ```

- **apps/api/venv/lib/python3.9/site-packages/black/concurrency.py:44** - Acesso a atributo de relação em loop
  ```python
  for task in tasks:
  ```

- **apps/api/venv/lib/python3.9/site-packages/black/concurrency.py:63** - Possível acesso a relação em serialização
  ```python
  cf_logger = logging.getLogger("concurrent.futures")
  ```

- **apps/api/venv/lib/python3.9/site-packages/black/cache.py:118** - Acesso a atributo de relação em loop
  ```python
  for src in sources:
  ```

- **apps/api/venv/lib/python3.9/site-packages/black/__init__.py:191** - Acesso a atributo de relação em loop
  ```python
  return [TargetVersion[val.upper()] for val in v]
  ```

- **apps/api/venv/lib/python3.9/site-packages/black/__init__.py:122** - Possível acesso a relação em serialização
  ```python
  """Inject Black configuration from "pyproject.toml" into defaults in `ctx`.
  ```

- **apps/api/venv/lib/python3.9/site-packages/black/brackets.py:158** - Loop com query de relação
  ```python
  return sum(1 for p in self.delimiters.values() if p == priority)
  ```

- **apps/api/venv/lib/python3.9/site-packages/black/brackets.py:158** - Acesso a atributo de relação em loop
  ```python
  return sum(1 for p in self.delimiters.values() if p == priority)
  ```

- **apps/api/venv/lib/python3.9/site-packages/black/lines.py:152** - Loop com query de relação
  ```python
  Leaf(token.DOT, ".") for _ in range(3)
  ```

- **apps/api/venv/lib/python3.9/site-packages/black/lines.py:152** - Acesso a atributo de relação em loop
  ```python
  Leaf(token.DOT, ".") for _ in range(3)
  ```

- **apps/api/venv/lib/python3.9/site-packages/black/ranges.py:23** - Acesso a atributo de relação em loop
  ```python
  for lines_str in line_ranges:
  ```

- **apps/api/venv/lib/python3.9/site-packages/black/debug.py:31** - Loop com query de relação
  ```python
  for child in node.children:
  ```

- **apps/api/venv/lib/python3.9/site-packages/black/debug.py:31** - Acesso a atributo de relação em loop
  ```python
  for child in node.children:
  ```

- **apps/api/venv/lib/python3.9/site-packages/black/trans.py:91** - Acesso a atributo de relação em loop
  ```python
  for leaf in line.leaves:
  ```

- **apps/api/venv/lib/python3.9/site-packages/black/trans.py:311** - Possível acesso a relação em serialização
  ```python
  def _get_key(string: str) -> "CustomSplitMapMixin._Key":
  ```

- **apps/api/venv/lib/python3.9/site-packages/black/nodes.py:171** - Acesso a atributo de relação em loop
  ```python
  for child in node.children:
  ```

- **apps/api/venv/lib/python3.9/site-packages/black/linegen.py:136** - Loop com query de relação
  ```python
  for comment in generate_comments(node):
  ```

- **apps/api/venv/lib/python3.9/site-packages/black/linegen.py:136** - Acesso a atributo de relação em loop
  ```python
  for comment in generate_comments(node):
  ```

- **apps/api/venv/lib/python3.9/site-packages/black/strings.py:53** - Acesso a atributo de relação em loop
  ```python
  for line in s.splitlines():
  ```

- **apps/api/venv/lib/python3.9/site-packages/black/output.py:65** - Acesso a atributo de relação em loop
  ```python
  for line in difflib.unified_diff(
  ```

- **apps/api/venv/lib/python3.9/site-packages/black/numerics.py:37** - Possível acesso a relação em serialização
  ```python
  """Formats a float string like "1.0"."""
  ```

- **apps/api/venv/lib/python3.9/site-packages/black/comments.py:68** - Acesso a atributo de relação em loop
  ```python
  for pc in list_comments(leaf.prefix, is_endmarker=leaf.type == token.ENDMARKER):
  ```

- **apps/api/venv/lib/python3.9/site-packages/dateutil/relativedelta.py:13** - Acesso a atributo de relação em loop
  ```python
  MO, TU, WE, TH, FR, SA, SU = weekdays = tuple(weekday(x) for x in range(7))
  ```

- **apps/api/venv/lib/python3.9/site-packages/dateutil/rrule.py:77** - Loop com query de relação
  ```python
  MO, TU, WE, TH, FR, SA, SU = weekdays = tuple(weekday(x) for x in range(7))
  ```

- **apps/api/venv/lib/python3.9/site-packages/dateutil/rrule.py:77** - Acesso a atributo de relação em loop
  ```python
  MO, TU, WE, TH, FR, SA, SU = weekdays = tuple(weekday(x) for x in range(7))
  ```

- **apps/api/venv/lib/python3.9/site-packages/dateutil/zoneinfo/__init__.py:35** - Loop com query de relação
  ```python
  for zf in tf.getmembers()
  ```

- **apps/api/venv/lib/python3.9/site-packages/dateutil/zoneinfo/__init__.py:35** - Acesso a atributo de relação em loop
  ```python
  for zf in tf.getmembers()
  ```

- **apps/api/venv/lib/python3.9/site-packages/dateutil/zoneinfo/rebuild.py:23** - Acesso a atributo de relação em loop
  ```python
  for name in zonegroups:
  ```

- **apps/api/venv/lib/python3.9/site-packages/dateutil/parser/_parser.py:177** - Loop com query de relação
  ```python
  for tok in l[1:]:
  ```

- **apps/api/venv/lib/python3.9/site-packages/dateutil/parser/_parser.py:177** - Acesso a atributo de relação em loop
  ```python
  for tok in l[1:]:
  ```

- **apps/api/venv/lib/python3.9/site-packages/dateutil/tz/tz.py:333** - Loop com query de relação
  ```python
  for attr in self.__slots__:
  ```

- **apps/api/venv/lib/python3.9/site-packages/dateutil/tz/tz.py:333** - Acesso a atributo de relação em loop
  ```python
  for attr in self.__slots__:
  ```

- **apps/api/venv/lib/python3.9/site-packages/dateutil/tz/_common.py:61** - Acesso a atributo de relação em loop
  ```python
  Python versions before 3.6. It is used only for dates in a fold, so
  ```

- **apps/api/venv/lib/python3.9/site-packages/dateutil/tz/win.py:154** - Acesso a atributo de relação em loop
  ```python
  for i in range(winreg.QueryInfoKey(tzkey)[0])]
  ```

- **apps/api/venv/lib/python3.9/site-packages/dateutil/tz/win.py:57** - Possível acesso a relação em serialização
  ```python
  def __init__(self, tzres_loc='tzres.dll'):
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/skipping.py:101** - Loop com query de relação
  ```python
  for dictionary in reversed(
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/skipping.py:101** - Acesso a atributo de relação em loop
  ```python
  for dictionary in reversed(
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/logging.py:125** - Loop com query de relação
  ```python
  color_kwargs = {name: True for name in color_opts}
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/logging.py:125** - Acesso a atributo de relação em loop
  ```python
  color_kwargs = {name: True for name in color_opts}
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/unittest.py:80** - Loop com query de relação
  ```python
  for name in loader.getTestCaseNames(self.obj):
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/unittest.py:80** - Acesso a atributo de relação em loop
  ```python
  for name in loader.getTestCaseNames(self.obj):
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/unittest.py:186** - Possível acesso a relação em serialização
  ```python
  _testcase: Optional["unittest.TestCase"] = None
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/unittest.py:213** - Possível acesso a relação em serialização
  ```python
  def startTest(self, testcase: "unittest.TestCase") -> None:
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/unittest.py:250** - Possível acesso a relação em serialização
  ```python
  self, testcase: "unittest.TestCase", rawexcinfo: "_SysExcInfoType"
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/unittest.py:260** - Possível acesso a relação em serialização
  ```python
  self, testcase: "unittest.TestCase", rawexcinfo: "_SysExcInfoType"
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/unittest.py:264** - Possível acesso a relação em serialização
  ```python
  def addSkip(self, testcase: "unittest.TestCase", reason: str) -> None:
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/unittest.py:272** - Possível acesso a relação em serialização
  ```python
  testcase: "unittest.TestCase",
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/unittest.py:283** - Possível acesso a relação em serialização
  ```python
  testcase: "unittest.TestCase",
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/unittest.py:295** - Possível acesso a relação em serialização
  ```python
  def addSuccess(self, testcase: "unittest.TestCase") -> None:
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/unittest.py:298** - Possível acesso a relação em serialização
  ```python
  def stopTest(self, testcase: "unittest.TestCase") -> None:
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/unittest.py:301** - Possível acesso a relação em serialização
  ```python
  def addDuration(self, testcase: "unittest.TestCase", elapsed: float) -> None:
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/python_path.py:15** - Acesso a atributo de relação em loop
  ```python
  for path in reversed(early_config.getini("pythonpath")):
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/runner.py:66** - Loop com query de relação
  ```python
  help="Minimal duration in seconds for inclusion in slowest list. "
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/runner.py:66** - Acesso a atributo de relação em loop
  ```python
  help="Minimal duration in seconds for inclusion in slowest list. "
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/helpconfig.py:142** - Loop com query de relação
  ```python
  for line in plugininfo:
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/helpconfig.py:142** - Acesso a atributo de relação em loop
  ```python
  for line in plugininfo:
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/helpconfig.py:84** - Possível acesso a relação em serialização
  ```python
  const="pytestdebug.log",
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/pastebin.py:99** - Acesso a atributo de relação em loop
  ```python
  for rep in terminalreporter.stats["failed"]:
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/compat.py:40** - Loop com query de relação
  ```python
  #  intended for removal in pytest 8.0 or 9.0
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/compat.py:40** - Acesso a atributo de relação em loop
  ```python
  #  intended for removal in pytest 8.0 or 9.0
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/compat.py:117** - Possível acesso a relação em serialização
  ```python
  ut_mock_sentinel = getattr(sys.modules.get("unittest.mock"), "DEFAULT", object())
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/terminal.py:277** - Loop com query de relação
  ```python
  for char in reportchars:
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/terminal.py:277** - Acesso a atributo de relação em loop
  ```python
  for char in reportchars:
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/warnings.py:57** - Acesso a atributo de relação em loop
  ```python
  for mark in item.iter_markers(name="filterwarnings"):
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/deprecated.py:104** - Acesso a atributo de relação em loop
  ```python
  " for alternatives in common use cases."
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/recwarn.py:191** - Possível acesso a relação em serialização
  ```python
  def list(self) -> List["warnings.WarningMessage"]:
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/recwarn.py:195** - Possível acesso a relação em serialização
  ```python
  def __getitem__(self, i: int) -> "warnings.WarningMessage":
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/recwarn.py:199** - Possível acesso a relação em serialização
  ```python
  def __iter__(self) -> Iterator["warnings.WarningMessage"]:
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/recwarn.py:207** - Possível acesso a relação em serialização
  ```python
  def pop(self, cls: Type[Warning] = Warning) -> "warnings.WarningMessage":
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/debugging.py:135** - Loop com query de relação
  ```python
  for part in parts[1:]:
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/debugging.py:135** - Acesso a atributo de relação em loop
  ```python
  for part in parts[1:]:
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/python_api.py:140** - Loop com query de relação
  ```python
  return seq_type(_recursive_sequence_map(f, xi) for xi in x)
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/python_api.py:140** - Acesso a atributo de relação em loop
  ```python
  return seq_type(_recursive_sequence_map(f, xi) for xi in x)
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/_argcomplete.py:93** - Loop com query de relação
  ```python
  for x in sorted(globbed):
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/_argcomplete.py:93** - Acesso a atributo de relação em loop
  ```python
  for x in sorted(globbed):
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/unraisableexception.py:37** - Possível acesso a relação em serialização
  ```python
  self.unraisable: Optional["sys.UnraisableHookArgs"] = None
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/unraisableexception.py:38** - Possível acesso a relação em serialização
  ```python
  self._old_hook: Optional[Callable[["sys.UnraisableHookArgs"], Any]] = None
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/unraisableexception.py:40** - Possível acesso a relação em serialização
  ```python
  def _hook(self, unraisable: "sys.UnraisableHookArgs") -> None:
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/hookspec.py:699** - Acesso a atributo de relação em loop
  ```python
  """Return explanation for comparisons in failing assert expressions.
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/hookspec.py:853** - Possível acesso a relação em serialização
  ```python
  warning_message: "warnings.WarningMessage",
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/hookspec.py:960** - Possível acesso a relação em serialização
  ```python
  def pytest_enter_pdb(config: "Config", pdb: "pdb.Pdb") -> None:
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/hookspec.py:971** - Possível acesso a relação em serialização
  ```python
  def pytest_leave_pdb(config: "Config", pdb: "pdb.Pdb") -> None:
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/pytester.py:146** - Acesso a atributo de relação em loop
  ```python
  for line in out.split("\n"):
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/pytester.py:516** - Possível acesso a relação em serialização
  ```python
  # Regex to match the session duration string in the summary: "74.34s".
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/pytester.py:827** - Possível acesso a relação em serialização
  ```python
  filename = pytester.path.joinpath("foo.bin")
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/pytester.py:878** - Possível acesso a relação em serialização
  ```python
  # At this point, both 'test_something.py' & 'custom.py' exist in the test directory.
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/pytester.py:878** - Possível acesso a relação em serialização
  ```python
  # At this point, both 'test_something.py' & 'custom.py' exist in the test directory.
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/pytester.py:898** - Possível acesso a relação em serialização
  ```python
  # At this point, both 'test_something.txt' & 'custom.txt' exist in the test directory.
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/pytester.py:898** - Possível acesso a relação em serialização
  ```python
  # At this point, both 'test_something.txt' & 'custom.txt' exist in the test directory.
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/pytester.py:939** - Possível acesso a relação em serialização
  ```python
  p.joinpath("__init__.py").touch()
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/pytester.py:975** - Possível acesso a relação em serialização
  ```python
  if example_path.is_dir() and not example_path.joinpath("__init__.py").is_file():
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/pytester.py:1517** - Possível acesso a relação em serialização
  ```python
  ) -> "pexpect.spawn":
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/pytester.py:1531** - Possível acesso a relação em serialização
  ```python
  def spawn(self, cmd: str, expect_timeout: float = 10.0) -> "pexpect.spawn":
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/pytester.py:1536** - Possível acesso a relação em serialização
  ```python
  pexpect = importorskip("pexpect", "3.0")
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/pytester.py:1541** - Possível acesso a relação em serialização
  ```python
  logfile = self.path.joinpath("spawn.out").open("wb")
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/pytester.py:1669** - Possível acesso a relação em serialização
  ```python
  "re.match",
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/pytester.py:1755** - Possível acesso a relação em serialização
  ```python
  pat, lambda name, pat: bool(re.match(pat, name)), "re.match"
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/junitxml.py:144** - Loop com query de relação
  ```python
  for key in self.attrs.keys():
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/junitxml.py:144** - Acesso a atributo de relação em loop
  ```python
  for key in self.attrs.keys():
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/junitxml.py:242** - Possível acesso a relação em serialização
  ```python
  skipped = ET.Element("skipped", type="pytest.xfail", message=xfailreason)
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/junitxml.py:251** - Possível acesso a relação em serialização
  ```python
  skipped = ET.Element("skipped", type="pytest.skip", message=skipreason)
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/junitxml.py:663** - Possível acesso a relação em serialização
  ```python
  logfile.write('<?xml version="1.0" encoding="utf-8"?>')
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/python.py:149** - Loop com query de relação
  ```python
  for marker in metafunc.definition.iter_markers(name="parametrize"):
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/python.py:149** - Acesso a atributo de relação em loop
  ```python
  for marker in metafunc.definition.iter_markers(name="parametrize"):
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/python.py:211** - Possível acesso a relação em serialização
  ```python
  file_path, parent.config.getini("python_files") + ["__init__.py"]
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/python.py:228** - Possível acesso a relação em serialização
  ```python
  if module_path.name == "__init__.py":
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/python.py:751** - Possível acesso a relação em serialização
  ```python
  if direntry.name == "__init__.py" and path.parent == this_path:
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/python.py:756** - Possível acesso a relação em serialização
  ```python
  str(pkg_prefix) in parts_ and pkg_prefix / "__init__.py" != path
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/python.py:766** - Possível acesso a relação em serialização
  ```python
  elif path.joinpath("__init__.py").is_file():
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/reports.py:331** - Acesso a atributo de relação em loop
  ```python
  keywords = {x: 1 for x in item.keywords}
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/reports.py:187** - Possível acesso a relação em serialização
  ```python
  In the example above, the head_line is "Test.foo".
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/doctest.py:154** - Loop com query de relação
  ```python
  return any(fnmatch_ex(glob, path) for glob in globs)
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/doctest.py:154** - Acesso a atributo de relação em loop
  ```python
  return any(fnmatch_ex(glob, path) for glob in globs)
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/doctest.py:67** - Possível acesso a relação em serialização
  ```python
  CHECKER_CLASS: Optional[Type["doctest.OutputChecker"]] = None
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/doctest.py:144** - Possível acesso a relação em serialização
  ```python
  if path.name != "setup.py":
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/doctest.py:158** - Possível acesso a relação em serialização
  ```python
  return path.name == "__main__.py"
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/doctest.py:175** - Possível acesso a relação em serialização
  ```python
  def __init__(self, failures: Sequence["doctest.DocTestFailure"]) -> None:
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/doctest.py:180** - Possível acesso a relação em serialização
  ```python
  def _init_runner_class() -> Type["doctest.DocTestRunner"]:
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/doctest.py:192** - Possível acesso a relação em serialização
  ```python
  checker: Optional["doctest.OutputChecker"] = None,
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/doctest.py:203** - Possível acesso a relação em serialização
  ```python
  test: "doctest.DocTest",
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/doctest.py:204** - Possível acesso a relação em serialização
  ```python
  example: "doctest.Example",
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/doctest.py:216** - Possível acesso a relação em serialização
  ```python
  test: "doctest.DocTest",
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/doctest.py:217** - Possível acesso a relação em serialização
  ```python
  example: "doctest.Example",
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/doctest.py:234** - Possível acesso a relação em serialização
  ```python
  checker: Optional["doctest.OutputChecker"] = None,
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/doctest.py:238** - Possível acesso a relação em serialização
  ```python
  ) -> "doctest.DocTestRunner":
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/doctest.py:258** - Possível acesso a relação em serialização
  ```python
  runner: Optional["doctest.DocTestRunner"] = None,
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/doctest.py:259** - Possível acesso a relação em serialização
  ```python
  dtest: Optional["doctest.DocTest"] = None,
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/doctest.py:273** - Possível acesso a relação em serialização
  ```python
  runner: "doctest.DocTestRunner",
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/doctest.py:274** - Possível acesso a relação em serialização
  ```python
  dtest: "doctest.DocTest",
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/doctest.py:295** - Possível acesso a relação em serialização
  ```python
  failures: List["doctest.DocTestFailure"] = []
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/doctest.py:449** - Possível acesso a relação em serialização
  ```python
  def _check_all_skipped(test: "doctest.DocTest") -> None:
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/doctest.py:559** - Possível acesso a relação em serialização
  ```python
  if self.path.name == "conftest.py":
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/doctest.py:610** - Possível acesso a relação em serialização
  ```python
  def _init_checker_class() -> Type["doctest.OutputChecker"]:
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/doctest.py:698** - Possível acesso a relação em serialização
  ```python
  def _get_checker() -> "doctest.OutputChecker":
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/setuponly.py:80** - Acesso a atributo de relação em loop
  ```python
  deps = sorted(arg for arg in fixturedef.argnames if arg != "request")
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/nodes.py:371** - Loop com query de relação
  ```python
  return (x[1] for x in self.iter_markers_with_node(name=name))
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/nodes.py:371** - Acesso a atributo de relação em loop
  ```python
  return (x[1] for x in self.iter_markers_with_node(name=name))
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/threadexception.py:37** - Possível acesso a relação em serialização
  ```python
  self.args: Optional["threading.ExceptHookArgs"] = None
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/threadexception.py:38** - Possível acesso a relação em serialização
  ```python
  self._old_hook: Optional[Callable[["threading.ExceptHookArgs"], Any]] = None
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/threadexception.py:40** - Possível acesso a relação em serialização
  ```python
  def _hook(self, args: "threading.ExceptHookArgs") -> None:
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/main.py:375** - Loop com query de relação
  ```python
  return any(fname.name in activates for fname in bindir.iterdir())
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/main.py:375** - Acesso a atributo de relação em loop
  ```python
  return any(fname.name in activates for fname in bindir.iterdir())
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/main.py:369** - Possível acesso a relação em serialização
  ```python
  "activate.csh",
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/main.py:370** - Possível acesso a relação em serialização
  ```python
  "activate.fish",
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/main.py:372** - Possível acesso a relação em serialização
  ```python
  "Activate.bat",
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/main.py:373** - Possível acesso a relação em serialização
  ```python
  "Activate.ps1",
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/main.py:715** - Possível acesso a relação em serialização
  ```python
  pkginit = parent / "__init__.py"
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/main.py:739** - Possível acesso a relação em serialização
  ```python
  pkginit = dirpath / "__init__.py"
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/main.py:819** - Possível acesso a relação em serialização
  ```python
  if argpath.name == "__init__.py" and isinstance(matching[0], Package):
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/monkeypatch.py:65** - Loop com query de relação
  ```python
  for part in parts:
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/monkeypatch.py:65** - Acesso a atributo de relação em loop
  ```python
  for part in parts:
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/monkeypatch.py:211** - Possível acesso a relação em serialização
  ```python
  monkeypatch.setattr("os.getcwd", lambda: "/")
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/legacypath.py:404** - Acesso a atributo de relação em loop
  ```python
  return [legacy_path(str(dp / x)) for x in input_values]
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/legacypath.py:242** - Possível acesso a relação em serialização
  ```python
  ) -> "pexpect.spawn":
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/legacypath.py:246** - Possível acesso a relação em serialização
  ```python
  def spawn(self, cmd: str, expect_timeout: float = 10.0) -> "pexpect.spawn":
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/pathlib.py:122** - Loop com query de relação
  ```python
  for parent in p.parents:
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/pathlib.py:122** - Acesso a atributo de relação em loop
  ```python
  for parent in p.parents:
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/pathlib.py:570** - Possível acesso a relação em serialização
  ```python
  if path.name == "__init__.py":
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/pathlib.py:581** - Possível acesso a relação em serialização
  ```python
  if module_file.endswith(os.sep + "__init__.py"):
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/pathlib.py:582** - Possível acesso a relação em serialização
  ```python
  module_file = module_file[: -(len(os.sep + "__init__.py"))]
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/pathlib.py:639** - Possível acesso a relação em serialização
  ```python
  to create empty modules "src" and "src.tests" after inserting "src.tests.test_foo",
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/pathlib.py:684** - Possível acesso a relação em serialização
  ```python
  if not parent.joinpath("__init__.py").is_file():
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/freeze_support.py:27** - Possível acesso a relação em serialização
  ```python
  ['_pytest._argcomplete', '_pytest._code.code', ...]
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/fixtures.py:171** - Loop com query de relação
  ```python
  for callspec in metafunc._calls:
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/fixtures.py:171** - Acesso a atributo de relação em loop
  ```python
  for callspec in metafunc._calls:
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/fixtures.py:123** - Possível acesso a relação em serialização
  ```python
  fixture_package_name = "{}/{}".format(fixturedef.baseid, "__init__.py")
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/fixtures.py:1468** - Possível acesso a relação em serialização
  ```python
  if p.name.startswith("conftest.py"):
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/cacheprovider.py:93** - Loop com query de relação
  ```python
  for prefix in (cls._CACHE_PREFIX_DIRS, cls._CACHE_PREFIX_VALUES):
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/cacheprovider.py:93** - Acesso a atributo de relação em loop
  ```python
  for prefix in (cls._CACHE_PREFIX_DIRS, cls._CACHE_PREFIX_VALUES):
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/cacheprovider.py:204** - Possível acesso a relação em serialização
  ```python
  readme_path = self._cachedir / "README.md"
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/cacheprovider.py:211** - Possível acesso a relação em serialização
  ```python
  cachedir_tag_path = self._cachedir.joinpath("CACHEDIR.TAG")
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/config/__init__.py:164** - Loop com query de relação
  ```python
  for line in formatted_tb.splitlines():
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/config/__init__.py:164** - Acesso a atributo de relação em loop
  ```python
  for line in formatted_tb.splitlines():
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/config/__init__.py:607** - Possível acesso a relação em serialização
  ```python
  conftestpath = parent / "conftest.py"
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/config/__init__.py:867** - Possível acesso a relação em serialização
  ```python
  is_package = fn.count("/") == 1 and fn.endswith("__init__.py")
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/config/__init__.py:870** - Possível acesso a relação em serialização
  ```python
  # we ignore "setup.py" at the root of the distribution
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/config/__init__.py:1715** - Possível acesso a relação em serialização
  ```python
  ) -> Tuple["warnings._ActionKind", str, Type[Warning], str, int]:
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/config/__init__.py:1757** - Possível acesso a relação em serialização
  ```python
  action: "warnings._ActionKind" = warnings._getaction(action_)  # type: ignore[attr-defined]
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/config/findpaths.py:105** - Acesso a atributo de relação em loop
  ```python
  args = [x for x in args if not str(x).startswith("-")]
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/config/findpaths.py:52** - Possível acesso a relação em serialização
  ```python
  # "pytest.ini" files are always the source of configuration, even if empty.
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/config/findpaths.py:53** - Possível acesso a relação em serialização
  ```python
  if filepath.name == "pytest.ini":
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/config/findpaths.py:65** - Possível acesso a relação em serialização
  ```python
  fail(CFG_PYTEST_SECTION.format(filename="setup.cfg"), pytrace=False)
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/config/findpaths.py:99** - Possível acesso a relação em serialização
  ```python
  "pytest.ini",
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/config/findpaths.py:101** - Possível acesso a relação em serialização
  ```python
  "pyproject.toml",
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/config/findpaths.py:102** - Possível acesso a relação em serialização
  ```python
  "tox.ini",
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/config/findpaths.py:103** - Possível acesso a relação em serialização
  ```python
  "setup.cfg",
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/config/findpaths.py:187** - Possível acesso a relação em serialização
  ```python
  if (possible_rootdir / "setup.py").is_file():
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/config/argparsing.py:79** - Loop com query de relação
  ```python
  for group in self._groups:
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/config/argparsing.py:79** - Acesso a atributo de relação em loop
  ```python
  for group in self._groups:
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/mark/__init__.py:119** - Loop com query de relação
  ```python
  for line in config.getini("markers"):
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/mark/__init__.py:119** - Acesso a atributo de relação em loop
  ```python
  for line in config.getini("markers"):
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/mark/structures.py:134** - Loop com query de relação
  ```python
  argnames = [x.strip() for x in argnames.split(",") if x.strip()]
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/mark/structures.py:134** - Acesso a atributo de relação em loop
  ```python
  argnames = [x.strip() for x in argnames.split(",") if x.strip()]
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/_code/code.py:185** - Acesso a atributo de relação em loop
  ```python
  for arg in self.code.getargs(var):
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/_code/code.py:1306** - Possível acesso a relação em serialização
  ```python
  if _PLUGGY_DIR.name == "__init__.py":
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/assertion/util.py:60** - Acesso a atributo de relação em loop
  ```python
  for values in raw_lines[1:]:
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/assertion/__init__.py:58** - Loop com query de relação
  ```python
  for name in names:
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/assertion/__init__.py:58** - Acesso a atributo de relação em loop
  ```python
  for name in names:
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/assertion/rewrite.py:198** - Loop com query de relação
  ```python
  for initial_path in self.session._initialpaths:
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/assertion/rewrite.py:198** - Acesso a atributo de relação em loop
  ```python
  for initial_path in self.session._initialpaths:
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/assertion/rewrite.py:200** - Possível acesso a relação em serialização
  ```python
  #     ['c:', 'projects', 'my_project', 'path.py']
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/assertion/rewrite.py:229** - Possível acesso a relação em serialização
  ```python
  if os.path.basename(fn) == "conftest.py":
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/_io/terminalwriter.py:98** - Acesso a atributo de relação em loop
  ```python
  for name in markup:
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/_py/error.py:74** - Possível acesso a relação em serialização
  ```python
  {"__module__": "py.error", "__doc__": os.strerror(eno)},
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/_py/path.py:97** - Acesso a atributo de relação em loop
  ```python
  for name in self._depend_on_existence:
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/_py/path.py:1053** - Possível acesso a relação em serialização
  ```python
  if not parent.join("__init__.py").exists():
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/_py/path.py:1122** - Possível acesso a relação em serialização
  ```python
  if self.basename == "__init__.py":
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/_py/path.py:1131** - Possível acesso a relação em serialização
  ```python
  if modfile.endswith(os.sep + "__init__.py"):
  ```

- **apps/api/venv/lib/python3.9/site-packages/_pytest/_py/path.py:1132** - Possível acesso a relação em serialização
  ```python
  if self.basename != "__init__.py":
  ```

- **apps/api/venv/lib/python3.9/site-packages/platformdirs/unix.py:55** - Loop com query de relação
  ```python
  return [self._append_app_name_and_version(p) for p in path.split(os.pathsep)]
  ```

- **apps/api/venv/lib/python3.9/site-packages/platformdirs/unix.py:55** - Acesso a atributo de relação em loop
  ```python
  return [self._append_app_name_and_version(p) for p in path.split(os.pathsep)]
  ```

- **apps/api/venv/lib/python3.9/site-packages/platformdirs/android.py:148** - Acesso a atributo de relação em loop
  ```python
  for path in sys.path:
  ```

- **apps/api/venv/lib/python3.9/site-packages/platformdirs/windows.py:241** - Acesso a atributo de relação em loop
  ```python
  if any(ord(c) > 255 for c in buf):  # noqa: PLR2004
  ```

- **apps/api/venv/lib/python3.9/site-packages/platformdirs/__main__.py:34** - Possível acesso a relação em serialização
  ```python
  dirs = PlatformDirs(app_name, app_author, version="1.0")
  ```

- **apps/api/venv/lib/python3.9/site-packages/pyflakes/api.py:49** - Acesso a atributo de relação em loop
  ```python
  for warning in w.messages:
  ```

- **apps/api/venv/lib/python3.9/site-packages/pyflakes/checker.py:33** - Loop com query de relação
  ```python
  return [n.body + n.orelse] + [[hdl] for hdl in n.handlers]
  ```

- **apps/api/venv/lib/python3.9/site-packages/pyflakes/checker.py:33** - Acesso a atributo de relação em loop
  ```python
  return [n.body + n.orelse] + [[hdl] for hdl in n.handlers]
  ```

- **apps/api/venv/lib/python3.9/site-packages/pyflakes/checker.py:870** - Possível acesso a relação em serialização
  ```python
  os.path.basename(self.filename) != '__init__.py':
  ```

- **apps/api/venv/lib/python3.9/site-packages/pyflakes/checker.py:1114** - Possível acesso a relação em serialização
  ```python
  if name == '__path__' and os.path.basename(self.filename) == '__init__.py':
  ```

- **apps/api/services/melhor_envio_service.py:166** - Loop com query de relação
  ```python
  peso=sum(p.get('peso', 1.0) * p.get('quantidade', 1) for p in produtos),
  ```

- **apps/api/services/melhor_envio_service.py:166** - Acesso a atributo de relação em loop
  ```python
  peso=sum(p.get('peso', 1.0) * p.get('quantidade', 1) for p in produtos),
  ```

- **apps/api/src/config.py:59** - Loop com query de relação
  ```python
  missing_vars = [var for var in required_vars if not os.environ.get(var)]
  ```

- **apps/api/src/config.py:59** - Acesso a atributo de relação em loop
  ```python
  missing_vars = [var for var in required_vars if not os.environ.get(var)]
  ```

- **apps/api/src/config.py:87** - Possível acesso a relação em serialização
  ```python
  db_path = Path(__file__).parent.parent / 'mestres_cafe.db'
  ```

- **apps/api/src/app.py:62** - Possível acesso a relação em serialização
  ```python
  db_path = pathlib.Path(__file__).parent.parent / "mestres_cafe.db"
  ```

- **apps/api/src/app.py:205** - Possível acesso a relação em serialização
  ```python
  return send_from_directory(static_folder, "index.html")
  ```

- **apps/api/src/utils/cache.py:192** - Acesso a atributo de relação em loop
  ```python
  for key in self._fallback_cache:
  ```

- **apps/api/src/models/database.py:56** - Possível acesso a relação em serialização
  ```python
  author_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
  ```

- **apps/api/src/models/database.py:85** - Possível acesso a relação em serialização
  ```python
  user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
  ```

- **apps/api/src/models/database.py:104** - Possível acesso a relação em serialização
  ```python
  user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=True)
  ```

- **apps/api/src/models/database.py:163** - Possível acesso a relação em serialização
  ```python
  assigned_to = db.Column(db.String(36), db.ForeignKey('users.id'))
  ```

- **apps/api/src/models/database.py:164** - Possível acesso a relação em serialização
  ```python
  customer_id = db.Column(db.String(36), db.ForeignKey('customers.id'))  # Se convertido
  ```

- **apps/api/src/models/database.py:218** - Possível acesso a relação em serialização
  ```python
  customer_id = db.Column(db.String(36), db.ForeignKey('customers.id'))
  ```

- **apps/api/src/models/database.py:219** - Possível acesso a relação em serialização
  ```python
  lead_id = db.Column(db.String(36), db.ForeignKey('leads.id'))
  ```

- **apps/api/src/models/database.py:220** - Possível acesso a relação em serialização
  ```python
  user_id = db.Column(db.String(36), db.ForeignKey('users.id'))  # Quem fez o contato
  ```

- **apps/api/src/models/database.py:270** - Possível acesso a relação em serialização
  ```python
  customer_id = db.Column(db.String(36), db.ForeignKey('customers.id'), nullable=False)
  ```

- **apps/api/src/models/database.py:271** - Possível acesso a relação em serialização
  ```python
  segment_id = db.Column(db.String(36), db.ForeignKey('customer_segments.id'), nullable=False)
  ```

- **apps/api/src/models/database.py:300** - Possível acesso a relação em serialização
  ```python
  account_id = db.Column(db.String(36), db.ForeignKey('financial_accounts.id'), nullable=False)
  ```

- **apps/api/src/models/database.py:309** - Possível acesso a relação em serialização
  ```python
  order_id = db.Column(db.String(36), db.ForeignKey('orders.id'))
  ```

- **apps/api/src/models/database.py:310** - Possível acesso a relação em serialização
  ```python
  customer_id = db.Column(db.String(36), db.ForeignKey('customers.id'))
  ```

- **apps/api/src/models/database.py:347** - Possível acesso a relação em serialização
  ```python
  product_id = db.Column(db.String(36), db.ForeignKey('products.id'))
  ```

- **apps/api/src/models/database.py:348** - Possível acesso a relação em serialização
  ```python
  blog_post_id = db.Column(db.String(36), db.ForeignKey('blog_posts.id'))
  ```

- **apps/api/src/models/database.py:408** - Possível acesso a relação em serialização
  ```python
  template_id = db.Column(db.String(36), db.ForeignKey('newsletter_templates.id'), nullable=False)
  ```

- **apps/api/src/models/database.py:443** - Possível acesso a relação em serialização
  ```python
  user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=True)
  ```

- **apps/api/src/models/database.py:496** - Possível acesso a relação em serialização
  ```python
  manager_id = db.Column(db.String(36), db.ForeignKey('employees.id'))
  ```

- **apps/api/src/models/database.py:513** - Possível acesso a relação em serialização
  ```python
  department_id = db.Column(db.String(36), db.ForeignKey('departments.id'))
  ```

- **apps/api/src/models/database.py:530** - Possível acesso a relação em serialização
  ```python
  employee_id = db.Column(db.String(36), db.ForeignKey('employees.id'), nullable=False)
  ```

- **apps/api/src/models/database.py:559** - Possível acesso a relação em serialização
  ```python
  employee_id = db.Column(db.String(36), db.ForeignKey('employees.id'), nullable=False)
  ```

- **apps/api/src/models/database.py:602** - Possível acesso a relação em serialização
  ```python
  employee_id = db.Column(db.String(36), db.ForeignKey('employees.id'), nullable=False)
  ```

- **apps/api/src/models/database.py:603** - Possível acesso a relação em serialização
  ```python
  benefit_id = db.Column(db.String(36), db.ForeignKey('benefits.id'), nullable=False)
  ```

- **apps/api/src/models/database.py:672** - Possível acesso a relação em serialização
  ```python
  supplier_id = db.Column(db.String(36), db.ForeignKey('suppliers.id'), nullable=False)
  ```

- **apps/api/src/models/database.py:690** - Possível acesso a relação em serialização
  ```python
  supplier_id = db.Column(db.String(36), db.ForeignKey('suppliers.id'), nullable=False)
  ```

- **apps/api/src/models/database.py:691** - Possível acesso a relação em serialização
  ```python
  product_id = db.Column(db.String(36), db.ForeignKey('products.id'), nullable=False)
  ```

- **apps/api/src/models/database.py:712** - Possível acesso a relação em serialização
  ```python
  supplier_id = db.Column(db.String(36), db.ForeignKey('suppliers.id'), nullable=False)
  ```

- **apps/api/src/models/database.py:713** - Possível acesso a relação em serialização
  ```python
  employee_id = db.Column(db.String(36), db.ForeignKey('employees.id'), nullable=False)
  ```

- **apps/api/src/models/database.py:741** - Possível acesso a relação em serialização
  ```python
  purchase_order_id = db.Column(db.String(36), db.ForeignKey('purchase_orders.id'), nullable=False)
  ```

- **apps/api/src/models/database.py:742** - Possível acesso a relação em serialização
  ```python
  product_id = db.Column(db.String(36), db.ForeignKey('products.id'), nullable=False)
  ```

- **apps/api/src/models/database.py:776** - Possível acesso a relação em serialização
  ```python
  customer_id = db.Column(db.String(36), db.ForeignKey('customers.id'), nullable=False)
  ```

- **apps/api/src/models/database.py:796** - Possível acesso a relação em serialização
  ```python
  customer_id = db.Column(db.String(36), db.ForeignKey('customers.id'), nullable=False)
  ```

- **apps/api/src/models/database.py:826** - Possível acesso a relação em serialização
  ```python
  customer_id = db.Column(db.String(36), db.ForeignKey('customers.id'), nullable=False)
  ```

- **apps/api/src/models/database.py:844** - Possível acesso a relação em serialização
  ```python
  customer_id = db.Column(db.String(36), db.ForeignKey('customers.id'), nullable=False)
  ```

- **apps/api/src/models/database.py:845** - Possível acesso a relação em serialização
  ```python
  user_id = db.Column(db.String(36), db.ForeignKey('users.id'))
  ```

- **apps/api/src/models/database.py:882** - Possível acesso a relação em serialização
  ```python
  user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
  ```

- **apps/api/src/models/database.py:883** - Possível acesso a relação em serialização
  ```python
  course_id = db.Column(db.String(36), db.ForeignKey('courses.id'), nullable=False)
  ```

- **apps/api/src/models/products.py:208** - Acesso a atributo de relação em loop
  ```python
  review_data['responses'] = [response.to_dict() for response in self.responses]
  ```

- **apps/api/src/models/products.py:73** - Possível acesso a relação em serialização
  ```python
  category_id = Column(Integer, ForeignKey('categories.id'))
  ```

- **apps/api/src/models/products.py:124** - Possível acesso a relação em serialização
  ```python
  product_id = Column(Integer, ForeignKey('products.id'), nullable=False)
  ```

- **apps/api/src/models/products.py:142** - Possível acesso a relação em serialização
  ```python
  product_id = Column(Integer, ForeignKey('products.id'), nullable=False)
  ```

- **apps/api/src/models/products.py:143** - Possível acesso a relação em serialização
  ```python
  user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
  ```

- **apps/api/src/models/products.py:245** - Possível acesso a relação em serialização
  ```python
  review_id = Column(Integer, ForeignKey('reviews.id'), nullable=False)
  ```

- **apps/api/src/models/products.py:246** - Possível acesso a relação em serialização
  ```python
  user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
  ```

- **apps/api/src/models/products.py:267** - Possível acesso a relação em serialização
  ```python
  review_id = Column(Integer, ForeignKey('reviews.id'), nullable=False)
  ```

- **apps/api/src/models/products.py:268** - Possível acesso a relação em serialização
  ```python
  admin_user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
  ```

- **apps/api/src/models/orders.py:107** - Acesso a atributo de relação em loop
  ```python
  return sum(item.quantity for item in self.items)
  ```

- **apps/api/src/models/orders.py:39** - Possível acesso a relação em serialização
  ```python
  user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
  ```

- **apps/api/src/models/orders.py:40** - Possível acesso a relação em serialização
  ```python
  checkout_session_id = Column(String(36), ForeignKey('checkout_sessions.id'))
  ```

- **apps/api/src/models/orders.py:76** - Possível acesso a relação em serialização
  ```python
  order_id = Column(Integer, ForeignKey('orders.id'), nullable=False)
  ```

- **apps/api/src/models/orders.py:77** - Possível acesso a relação em serialização
  ```python
  product_id = Column(Integer, ForeignKey('products.id'), nullable=False)
  ```

- **apps/api/src/models/orders.py:95** - Possível acesso a relação em serialização
  ```python
  user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
  ```

- **apps/api/src/models/orders.py:123** - Possível acesso a relação em serialização
  ```python
  cart_id = Column(Integer, ForeignKey('carts.id'), nullable=False)
  ```

- **apps/api/src/models/orders.py:124** - Possível acesso a relação em serialização
  ```python
  product_id = Column(Integer, ForeignKey('products.id'), nullable=False)
  ```

- **apps/api/src/models/orders.py:157** - Possível acesso a relação em serialização
  ```python
  order_id = Column(Integer, ForeignKey('orders.id'), nullable=False)
  ```

- **apps/api/src/models/stock.py:18** - Possível acesso a relação em serialização
  ```python
  product_id = db.Column(db.String(36), db.ForeignKey('products.id'), nullable=False)
  ```

- **apps/api/src/models/stock.py:27** - Possível acesso a relação em serialização
  ```python
  supplier_id = db.Column(db.String(36), db.ForeignKey('suppliers.id'))
  ```

- **apps/api/src/models/stock.py:28** - Possível acesso a relação em serialização
  ```python
  order_id = db.Column(db.String(36), db.ForeignKey('orders.id'))
  ```

- **apps/api/src/models/stock.py:31** - Possível acesso a relação em serialização
  ```python
  created_by = db.Column(db.String(36), db.ForeignKey('users.id'))
  ```

- **apps/api/src/models/stock.py:42** - Possível acesso a relação em serialização
  ```python
  product_id = db.Column(db.String(36), db.ForeignKey('products.id'), nullable=False)
  ```

- **apps/api/src/models/stock.py:58** - Possível acesso a relação em serialização
  ```python
  product_id = db.Column(db.String(36), db.ForeignKey('products.id'), nullable=False)
  ```

- **apps/api/src/models/stock.py:63** - Possível acesso a relação em serialização
  ```python
  supplier_id = db.Column(db.String(36), db.ForeignKey('suppliers.id'))
  ```

- **apps/api/src/models/stock.py:78** - Possível acesso a relação em serialização
  ```python
  product_id = db.Column(db.String(36), db.ForeignKey('products.id'), nullable=False)
  ```

- **apps/api/src/models/stock.py:86** - Possível acesso a relação em serialização
  ```python
  created_by = db.Column(db.String(36), db.ForeignKey('users.id'))
  ```

- **apps/api/src/models/wishlist.py:13** - Possível acesso a relação em serialização
  ```python
  user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
  ```

- **apps/api/src/models/wishlist.py:37** - Possível acesso a relação em serialização
  ```python
  wishlist_id = Column(Integer, ForeignKey('wishlists.id'), nullable=False)
  ```

- **apps/api/src/models/wishlist.py:38** - Possível acesso a relação em serialização
  ```python
  product_id = Column(Integer, ForeignKey('products.id'), nullable=False)
  ```

- **apps/api/src/models/melhor_envio.py:44** - Possível acesso a relação em serialização
  ```python
  order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
  ```

- **apps/api/src/models/melhor_envio.py:65** - Possível acesso a relação em serialização
  ```python
  envio_id = db.Column(db.Integer, db.ForeignKey('envios_melhor_envio.id'), nullable=False)
  ```

- **apps/api/src/models/checkout.py:46** - Possível acesso a relação em serialização
  ```python
  user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
  ```

- **apps/api/src/models/checkout.py:60** - Possível acesso a relação em serialização
  ```python
  shipping_address_id = Column(String(36), ForeignKey('shipping_addresses.id'))
  ```

- **apps/api/src/models/checkout.py:150** - Possível acesso a relação em serialização
  ```python
  user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
  ```

- **apps/api/src/models/checkout.py:216** - Possível acesso a relação em serialização
  ```python
  checkout_session_id = Column(String(36), ForeignKey('checkout_sessions.id'), nullable=False)
  ```

- **apps/api/src/models/checkout.py:354** - Possível acesso a relação em serialização
  ```python
  checkout_session_id = Column(String(36), ForeignKey('checkout_sessions.id'))
  ```

- **apps/api/src/models/checkout.py:355** - Possível acesso a relação em serialização
  ```python
  user_id = Column(Integer, ForeignKey('users.id'))
  ```

- **apps/api/src/models/base.py:23** - Acesso a atributo de relação em loop
  ```python
  return {c.name: getattr(self, c.name) for c in self.__table__.columns}
  ```

- **apps/api/src/controllers/reviews.py:179** - Loop com query de relação
  ```python
  total_rating = sum(review.rating for review in reviews)
  ```

- **apps/api/src/controllers/reviews.py:179** - Acesso a atributo de relação em loop
  ```python
  total_rating = sum(review.rating for review in reviews)
  ```

- **apps/api/src/controllers/shipping.py:44** - Loop com query de relação
  ```python
  for field in required_fields:
  ```

- **apps/api/src/controllers/shipping.py:44** - Acesso a atributo de relação em loop
  ```python
  for field in required_fields:
  ```

- **apps/api/src/controllers/routes/user.py:9** - Acesso a atributo de relação em loop
  ```python
  return jsonify([user.to_dict() for user in users])
  ```

- **apps/api/src/controllers/routes/media.py:27** - Loop com query de relação
  ```python
  for folder in folders:
  ```

- **apps/api/src/controllers/routes/media.py:27** - Acesso a atributo de relação em loop
  ```python
  for folder in folders:
  ```

- **apps/api/src/controllers/routes/payments.py:156** - Loop com query de relação
  ```python
  } for payment in payments]
  ```

- **apps/api/src/controllers/routes/payments.py:156** - Acesso a atributo de relação em loop
  ```python
  } for payment in payments]
  ```

- **apps/api/src/controllers/routes/crm.py:57** - Loop com query de relação
  ```python
  } for customer in customers.items],
  ```

- **apps/api/src/controllers/routes/crm.py:57** - Acesso a atributo de relação em loop
  ```python
  } for customer in customers.items],
  ```

- **apps/api/src/controllers/routes/products.py:43** - Loop com query de relação
  ```python
  } for product in products.items],
  ```

- **apps/api/src/controllers/routes/products.py:43** - Acesso a atributo de relação em loop
  ```python
  } for product in products.items],
  ```

- **apps/api/src/controllers/routes/orders.py:32** - Loop com query de relação
  ```python
  } for order in orders.items],
  ```

- **apps/api/src/controllers/routes/orders.py:32** - Acesso a atributo de relação em loop
  ```python
  } for order in orders.items],
  ```

- **apps/api/src/controllers/routes/financial.py:27** - Loop com query de relação
  ```python
  } for account in accounts]
  ```

- **apps/api/src/controllers/routes/financial.py:27** - Acesso a atributo de relação em loop
  ```python
  } for account in accounts]
  ```

- **apps/api/src/controllers/routes/financial.py:315** - Query sem joins explícitos
  ```python
  receivables = FinancialTransaction.query.filter(
  ```

- **apps/api/src/controllers/routes/financial.py:360** - Query sem joins explícitos
  ```python
  payables = FinancialTransaction.query.filter(
  ```

- **apps/api/src/controllers/routes/stock.py:82** - Loop com query de relação
  ```python
  for m in movements
  ```

- **apps/api/src/controllers/routes/stock.py:82** - Acesso a atributo de relação em loop
  ```python
  for m in movements
  ```

- **apps/api/src/controllers/routes/stock.py:556** - Query sem joins explícitos
  ```python
  products = Product.query.filter(
  ```

- **apps/api/src/controllers/routes/stock.py:591** - Query sem joins explícitos
  ```python
  batches = ProductBatch.query.filter(
  ```

- **apps/api/src/controllers/routes/stock.py:679** - Query sem joins explícitos
  ```python
  products = Product.query.filter(Product.stock_quantity > 0).all()
  ```

- **apps/api/src/controllers/routes/hr.py:28** - Loop com query de relação
  ```python
  } for emp in employees]), 200
  ```

- **apps/api/src/controllers/routes/hr.py:28** - Acesso a atributo de relação em loop
  ```python
  } for emp in employees]), 200
  ```

- **apps/api/src/controllers/routes/dashboard.py:50** - Loop com query de relação
  ```python
  } for order in recent_orders],
  ```

- **apps/api/src/controllers/routes/dashboard.py:50** - Acesso a atributo de relação em loop
  ```python
  } for order in recent_orders],
  ```

- **apps/api/src/controllers/routes/melhor_envio.py:166** - Acesso a atributo de relação em loop
  ```python
  for field in required_fields:
  ```

- **apps/api/src/controllers/routes/admin.py:68** - Loop com query de relação
  ```python
  } for user in users.items],
  ```

- **apps/api/src/controllers/routes/admin.py:68** - Acesso a atributo de relação em loop
  ```python
  } for user in users.items],
  ```

- **apps/api/src/controllers/routes/admin.py:29** - Query sem joins explícitos
  ```python
  recent_orders = Order.query.filter(Order.created_at >= thirty_days_ago).count()
  ```

- **apps/api/src/controllers/routes/checkout.py:66** - Loop com query de relação
  ```python
  total_weight = sum(p.get('weight', 0.5) * p.get('quantity', 1) for p in products)
  ```

- **apps/api/src/controllers/routes/checkout.py:66** - Acesso a atributo de relação em loop
  ```python
  total_weight = sum(p.get('weight', 0.5) * p.get('quantity', 1) for p in products)
  ```

- **apps/api/src/controllers/routes/newsletter.py:368** - Loop com query de relação
  ```python
  for template in templates
  ```

- **apps/api/src/controllers/routes/newsletter.py:368** - Acesso a atributo de relação em loop
  ```python
  for template in templates
  ```

- **apps/api/src/controllers/routes/fiscal.py:54** - Loop com query de relação
  ```python
  for item in order.items
  ```

- **apps/api/src/controllers/routes/fiscal.py:54** - Acesso a atributo de relação em loop
  ```python
  for item in order.items
  ```

- **apps/api/src/controllers/routes/fiscal.py:176** - Possível acesso a relação em serialização
  ```python
  xml_content = f"""<?xml version="1.0" encoding="UTF-8"?>
  ```

- **apps/api/src/controllers/routes/fiscal.py:177** - Possível acesso a relação em serialização
  ```python
  <nfeProc xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
  ```

- **apps/api/src/controllers/routes/notifications.py:107** - Loop com query de relação
  ```python
  for recipient in recipients:
  ```

- **apps/api/src/controllers/routes/notifications.py:107** - Acesso a atributo de relação em loop
  ```python
  for recipient in recipients:
  ```

- **apps/api/src/controllers/routes/notifications.py:272** - Query sem joins explícitos
  ```python
  customers = Customer.query.filter(
  ```

- **apps/api/src/controllers/routes/notifications.py:280** - Query sem joins explícitos
  ```python
  customers = Customer.query.filter(
  ```

- **apps/api/src/controllers/routes/courses.py:29** - Loop com query de relação
  ```python
  } for c in courses
  ```

- **apps/api/src/controllers/routes/courses.py:29** - Acesso a atributo de relação em loop
  ```python
  } for c in courses
  ```

- **apps/api/src/controllers/routes/suppliers.py:33** - Loop com query de relação
  ```python
  } for sup in suppliers]), 200
  ```

- **apps/api/src/controllers/routes/suppliers.py:33** - Acesso a atributo de relação em loop
  ```python
  } for sup in suppliers]), 200
  ```

- **apps/api/src/controllers/routes/blog.py:32** - Loop com query de relação
  ```python
  } for post in posts.items],
  ```

- **apps/api/src/controllers/routes/blog.py:32** - Acesso a atributo de relação em loop
  ```python
  } for post in posts.items],
  ```

- **apps/api/src/controllers/routes/customers.py:24** - Loop com query de relação
  ```python
  } for ct in types]), 200
  ```

- **apps/api/src/controllers/routes/customers.py:24** - Acesso a atributo de relação em loop
  ```python
  } for ct in types]), 200
  ```

- **apps/api/src/controllers/routes/gamification.py:21** - Loop com query de relação
  ```python
  } for level in levels]
  ```

- **apps/api/src/controllers/routes/gamification.py:21** - Acesso a atributo de relação em loop
  ```python
  } for level in levels]
  ```

- **apps/api/src/controllers/routes/gamification.py:35** - Query sem joins explícitos
  ```python
  current_level = GamificationLevel.query.filter(
  ```

