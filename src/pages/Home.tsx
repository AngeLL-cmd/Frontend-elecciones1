import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";
import { voterApi } from "@/services/api";

const Home = () => {
  const [dni, setDni] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleDniSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await voterApi.verify(dni);
      
      if (response.success && response.data) {
        // Guardar datos del votante en sessionStorage
        sessionStorage.setItem('voter', JSON.stringify(response.data));
        sessionStorage.setItem('voterDni', dni);
        // Guardar tiempo de inicio de sesión (inicia el contador de 5 minutos)
        sessionStorage.setItem('session_start_time', Date.now().toString());
        // Redirigir a la página de votación
        navigate('/votar');
      } else {
        setError(response.error || 'Error al verificar el DNI');
      }
    } catch (err) {
      setError('Error de conexión. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center space-y-4">
            <div>
              <h1 className="text-4xl font-bold text-primary mb-2">Elecciones Perú 2025</h1>
              <p className="text-muted-foreground">Sistema de Votación Electoral</p>
            </div>
            <CardTitle className="text-2xl">Verificación de identidad</CardTitle>
            <CardDescription>
              Ingrese su DNI para acceder al sistema de votación
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleDniSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="dni">DNI (8 dígitos)</Label>
                <Input
                  id="dni"
                  type="text"
                  placeholder="Ingresa tu DNI (8 dígitos)"
                  value={dni}
                  onChange={(e) => {
                    setDni(e.target.value.replace(/\D/g, "").slice(0, 8));
                    setError(null);
                  }}
                  maxLength={8}
                  required
                  className="text-lg"
                  autoFocus
                  disabled={loading}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-peru hover:opacity-90 text-lg py-6"
                disabled={dni.length !== 8 || loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  'Iniciar Votación'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Home;

