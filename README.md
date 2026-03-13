# ActionPlan: Future-Aware Streaming Motion Synthesis via Frame-Level Action Planning

<p align="center">
  <a href="#"><b>[🌐 Project Page]</b></a>
  <a href="#"><b>[📄 arXiv]</b></a>
  <a href="#"><b>[💻 Code]</b></a>
</p>

This is the official repository for **ActionPlan**.

---

## 🚀 News
- **[2026]** ActionPlan is on arXiv!
- **[Coming Soon]** We will release the full code and pre-trained models.
- **⭐ Star us** to get notified when the code is released!

## 📦 Content to be Released
- [ ] **Core Code**: Training and inference pipeline.
- [ ] **Model Weights**: Pre-trained checkpoints for ActionPlan.

## 📄 Abstract
We present **ActionPlan**, a unified motion diffusion framework that bridges real-time streaming with high-quality offline generation within a single model. The core idea is to introduce a *per-frame action plan*: the model predicts frame-level text latents that act as dense semantic anchors throughout denoising, and uses them to denoise the full motion sequence with combined semantic and motion cues.

To support this structured workflow, we design latent-specific diffusion steps, allowing each motion latent to be denoised independently and sampled in flexible orders at inference. As a result, ActionPlan can run in a history-conditioned, future-aware mode for real-time streaming, while also supporting high-quality offline generation.

The same mechanism further enables zero-shot motion editing and in-betweening without additional models. Experiments demonstrate that our real-time streaming is **5.25× faster** while achieving **18% motion quality improvement** over the best previous method in terms of FID.

## ✍️ Citation
If you find our work or code useful for your research, please consider citing:

```bibtex
@article{nazarenus2026actionplan,
  title   = {{ActionPlan}: Future-Aware Streaming Motion Synthesis via Frame-Level Action Planning},
  author  = {Nazarenus, Eric and Li, Chuqiao and He, Yannan and Xie, Xianghui and Lenssen, Jan Eric and Pons-Moll, Gerard},
  journal = {arXiv preprint},
  year    = {2026}
}
```
