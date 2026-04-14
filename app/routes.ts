import { type RouteConfig, route, layout, index } from "@react-router/dev/routes";

export default [
  layout("routes/_public.tsx", [
    index("routes/home.tsx"),
    route("saas-java", "routes/saas-java.tsx"),
    route("arquitectura-microservicios", "routes/arquitectura-microservicios.tsx"),
    route("integraciones-empresariales", "routes/integraciones-empresariales.tsx"),
    route("migracion-sistemas-legacy", "routes/migracion-sistemas-legacy.tsx"),
    route("solucion", "pages/Product.tsx"),
    route("contacto", "pages/Contact.tsx"),
    route("servicios", "pages/Servicios.tsx"),
    route("servicios/ecommerce", "pages/ServicioEcommerce.tsx"),
    route("servicios/erp", "pages/ServicioERP.tsx"),
  ]),
  route("admin", "pages/Admin.tsx")
] satisfies RouteConfig;
