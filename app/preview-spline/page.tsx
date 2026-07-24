import { SplineSceneBasic } from "@/components/marketing/spline-demo";

export default function PreviewPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-8">
      <div className="w-full max-w-5xl">
        <h1 className="mb-8 text-center text-2xl font-bold text-white">Spline Scene Component Preview</h1>
        <SplineSceneBasic />
      </div>
    </div>
  );
}
