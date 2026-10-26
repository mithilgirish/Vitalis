#!/usr/bin/env python3
"""
Vitalis Presentation Generator
Creates a 16-slide high-definition widescreen (16:9) presentation
following Jony Ive / Apple minimalist design language with glassmorphic cards,
refined typography, subtle pill badges, and comprehensive technical depth.
"""

import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

def create_deck(output_path="Vitalis_Presentation.pptx", logo_path="docs/Vitalis_logo.png"):
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Jony Ive Inspired Dark Glassmorphism Palette
    BG_COLOR = RGBColor(11, 14, 20)           # Deep Space Obsidian
    CARD_BG = RGBColor(20, 26, 38)            # Translucent Slate Glass fill
    CARD_BORDER = RGBColor(46, 56, 77)        # Specular Frost Rim Border
    CARD_INNER_BG = RGBColor(28, 36, 52)      # Elevated Glass Layer
    
    TEXT_WHITE = RGBColor(248, 250, 252)      # Pure Titanium White
    TEXT_MUTED = RGBColor(148, 163, 184)      # Cool Atmospheric Slate
    TEXT_DIM = RGBColor(100, 116, 139)        # Subtle Meta Text
    
    ACCENT_CYAN = RGBColor(14, 165, 233)      # Vitalis Telemetry Cyan
    ACCENT_ROSE = RGBColor(244, 63, 94)       # Emergency Clinical Crimson
    ACCENT_EMERALD = RGBColor(16, 185, 129)   # Guardrail Safe Emerald
    ACCENT_AMBER = RGBColor(245, 158, 11)     # Warning Amber
    ACCENT_VIOLET = RGBColor(168, 85, 247)    # AI/ReAct Violet

    def apply_bg(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = BG_COLOR
        bg.line.color.rgb = BG_COLOR
        return bg

    def add_glass_card(slide, left, top, width, height, border_color=CARD_BORDER, bg_color=CARD_BG):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = bg_color
        card.line.color.rgb = border_color
        card.line.width = Pt(1.2)
        return card

    def add_pill_badge(slide, left, top, width, height, text, text_color=ACCENT_CYAN, border_color=CARD_BORDER):
        badge = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        badge.fill.solid()
        badge.fill.fore_color.rgb = RGBColor(18, 24, 35)
        badge.line.color.rgb = border_color
        badge.line.width = Pt(1.0)
        tf = badge.text_frame
        tf.vertical_anchor = MSO_ANCHOR.MIDDLE
        tf.word_wrap = False
        p = tf.paragraphs[0]
        p.alignment = PP_ALIGN.CENTER
        run = p.add_run()
        run.text = text
        run.font.name = "Inter"
        run.font.size = Pt(8.5)
        run.font.bold = True
        run.font.color.rgb = text_color
        return badge

    def add_header(slide, tag_text, title_text, subtitle_text=None, tag_color=ACCENT_CYAN):
        # Tag Badge
        add_pill_badge(slide, Inches(0.8), Inches(0.48), Inches(3.2), Inches(0.32), tag_text.upper(), tag_color)
        
        # Main Title Box
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.85), Inches(11.733), Inches(0.8))
        tf = title_box.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        p = tf.paragraphs[0]
        run = p.add_run()
        run.text = title_text
        run.font.name = "Inter"
        run.font.size = Pt(24)
        run.font.bold = True
        run.font.color.rgb = TEXT_WHITE

        if subtitle_text:
            p2 = tf.add_paragraph()
            p2.space_before = Pt(4)
            run2 = p2.add_run()
            run2.text = subtitle_text
            run2.font.name = "Inter"
            run2.font.size = Pt(12)
            run2.font.color.rgb = TEXT_MUTED

    def add_footer(slide, current_slide, total_slides=16):
        box = slide.shapes.add_textbox(Inches(0.8), Inches(7.0), Inches(11.733), Inches(0.35))
        tf = box.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        p = tf.paragraphs[0]
        
        run_left = p.add_run()
        run_left.text = "VITALIS  ·  PREDICTIVE CLINICAL LOGISTICS PLATFORM"
        run_left.font.name = "Inter"
        run_left.font.size = Pt(8.5)
        run_left.font.color.rgb = TEXT_DIM

        run_right = p.add_run()
        run_right.text = f"                                                                                                                    {current_slide:02d} / {total_slides:02d}"
        run_right.font.name = "Inter"
        run_right.font.size = Pt(8.5)
        run_right.font.bold = True
        run_right.font.color.rgb = TEXT_MUTED

    # =========================================================================
    # SLIDE 1: Title Slide (Jony Ive Pure Minimalism)
    # =========================================================================
    s1 = prs.slides.add_slide(blank_layout)
    apply_bg(s1)

    # Ambient Frosted Halo
    add_glass_card(s1, Inches(1.2), Inches(1.0), Inches(10.933), Inches(5.5), border_color=RGBColor(38, 48, 68), bg_color=RGBColor(16, 21, 31))

    # Logo
    if os.path.exists(logo_path):
        s1.shapes.add_picture(logo_path, Inches(1.8), Inches(1.8), width=Inches(1.6), height=Inches(1.6))

    # Title & Subhead
    tb = s1.shapes.add_textbox(Inches(3.8), Inches(1.7), Inches(7.8), Inches(3.8))
    tf = tb.text_frame
    tf.word_wrap = True
    
    p = tf.paragraphs[0]
    badge = p.add_run()
    badge.text = "AUTONOMOUS HEALTHCARE INFRASTRUCTURE  ·  BCSE335L\n"
    badge.font.name = "Inter"
    badge.font.size = Pt(10)
    badge.font.bold = True
    badge.font.color.rgb = ACCENT_CYAN

    p2 = tf.add_paragraph()
    p2.space_before = Pt(8)
    title_run = p2.add_run()
    title_run.text = "Vitalis"
    title_run.font.name = "Inter"
    title_run.font.size = Pt(44)
    title_run.font.bold = True
    title_run.font.color.rgb = TEXT_WHITE

    p3 = tf.add_paragraph()
    p3.space_before = Pt(4)
    sub_run = p3.add_run()
    sub_run.text = "Predictive Clinical Logistics & Agentic Supply Redistribution"
    sub_run.font.name = "Inter"
    sub_run.font.size = Pt(17)
    sub_run.font.color.rgb = TEXT_MUTED

    p4 = tf.add_paragraph()
    p4.space_before = Pt(16)
    quote_run = p4.add_run()
    quote_run.text = "“Simplicity is not the lack of clutter. It is the consequence of bringing profound order to the critical boundary between life and death.”"
    quote_run.font.name = "Inter"
    quote_run.font.size = Pt(12)
    quote_run.font.italic = True
    quote_run.font.color.rgb = RGBColor(186, 200, 222)

    # 4 Floating Key Specs at bottom of card
    specs = [
        ("LANGCHAIN ReAct", "Autonomous Multi-Tool Solver"),
        ("PROPHET + XGBOOST", "14-Day Demand & Guardrails"),
        ("HUMAN-IN-THE-LOOP", "Ethical Clinical Governance"),
        ("EXPO & TOMTOM", "Cold-Chain IoT & Asphalt Routing"),
    ]
    for i, (spec_title, spec_desc) in enumerate(specs):
        left_pos = Inches(1.6 + i * 2.55)
        add_glass_card(s1, left_pos, Inches(4.8), Inches(2.4), Inches(1.2), border_color=RGBColor(38, 48, 68), bg_color=CARD_INNER_BG)
        box = s1.shapes.add_textbox(left_pos + Inches(0.12), Inches(4.9), Inches(2.16), Inches(1.0))
        stf = box.text_frame
        stf.word_wrap = True
        sp1 = stf.paragraphs[0]
        sr1 = sp1.add_run()
        sr1.text = spec_title
        sr1.font.name = "Inter"
        sr1.font.size = Pt(9.5)
        sr1.font.bold = True
        sr1.font.color.rgb = ACCENT_CYAN

        sp2 = stf.add_paragraph()
        sp2.space_before = Pt(3)
        sr2 = sp2.add_run()
        sr2.text = spec_desc
        sr2.font.name = "Inter"
        sr2.font.size = Pt(9)
        sr2.font.color.rgb = TEXT_MUTED

    add_footer(s1, 1)

    # =========================================================================
    # SLIDE 2: The Clinical Problem (Fragmented Supply Chain)
    # =========================================================================
    s2 = prs.slides.add_slide(blank_layout)
    apply_bg(s2)
    add_header(s2, "Clinical Crisis & Problem Definition", "The Fatal Cost of Siloed Healthcare Logistics",
               "Over 100,000 preventable deaths occur annually due to localized biological shortages, not global scarcity.", ACCENT_ROSE)

    # 3 Column Glass Cards
    col_width = Inches(3.64)
    c1 = add_glass_card(s2, Inches(0.8), Inches(1.85), col_width, Inches(4.8))
    c2 = add_glass_card(s2, Inches(4.84), Inches(1.85), col_width, Inches(4.8))
    c3 = add_glass_card(s2, Inches(8.88), Inches(1.85), col_width, Inches(4.8))

    cards_data = [
        (Inches(0.8), "01 / SILOED BLIND SPOTS", "Zero Inter-Hospital Visibility",
         "Emergency departments operate as disconnected data islands. Inventory systems share no real-time telemetry with neighboring regional clinics.",
         [("100K+", "Preventable deaths each year"), ("0%", "Real-time cross-facility sync"), ("Reactive", "Panic ordering post-shock")],
         ACCENT_ROSE),
        (Inches(4.84), "02 / THE CASCADE EFFECT", "Predatory Drawdowns & Secondary Stockouts",
         "Drawing supplies from the nearest hospital frequently plunges the donor hospital below safety reserves, causing secondary fatal stockouts within 72 hours.",
         [("72 Hours", "Critical risk vulnerability window"), ("> 40%", "Depletion probability without AI"), ("Zero", "Depletion guardrail awareness")],
         ACCENT_AMBER),
        (Inches(8.88), "03 / BIOLOGICAL DECAY", "Strict Viability & Transit Windows",
         "Blood and organs degrade rapidly. Platelets require continuous agitation (5-day limit); organs degrade within 4 to 24 hours. Transit must be precision-governed.",
         [("1°C - 6°C", "PRBC cold storage requirement"), ("4 Hours", "Max ischemic time for heart/lung"), ("Spoilage", "Massive logistical wastage")],
         ACCENT_CYAN)
    ]

    for left_p, badge_t, head_t, desc_t, stats, color in cards_data:
        add_pill_badge(s2, left_p + Inches(0.2), Inches(2.05), Inches(2.8), Inches(0.3), badge_t, color)
        tb = s2.shapes.add_textbox(left_p + Inches(0.2), Inches(2.45), col_width - Inches(0.4), Inches(4.0))
        tf = tb.text_frame
        tf.word_wrap = True
        
        p = tf.paragraphs[0]
        r = p.add_run()
        r.text = head_t
        r.font.name = "Inter"
        r.font.size = Pt(16)
        r.font.bold = True
        r.font.color.rgb = TEXT_WHITE

        p2 = tf.add_paragraph()
        p2.space_before = Pt(8)
        r2 = p2.add_run()
        r2.text = desc_t
        r2.font.name = "Inter"
        r2.font.size = Pt(11)
        r2.font.color.rgb = TEXT_MUTED

        # Stat cards inside
        for s_idx, (val, lbl) in enumerate(stats):
            top_offset = Inches(3.9 + s_idx * 0.82)
            add_glass_card(s2, left_p + Inches(0.2), top_offset, col_width - Inches(0.4), Inches(0.72),
                           border_color=RGBColor(38, 48, 68), bg_color=CARD_INNER_BG)
            stb = s2.shapes.add_textbox(left_p + Inches(0.3), top_offset + Inches(0.06), col_width - Inches(0.6), Inches(0.6))
            stf = stb.text_frame
            stf.word_wrap = True
            sp1 = stf.paragraphs[0]
            sr1 = sp1.add_run()
            sr1.text = val + "  "
            sr1.font.name = "Inter"
            sr1.font.size = Pt(14)
            sr1.font.bold = True
            sr1.font.color.rgb = color

            sr2 = sp1.add_run()
            sr2.text = "·  " + lbl
            sr2.font.name = "Inter"
            sr2.font.size = Pt(10)
            sr2.font.color.rgb = TEXT_MUTED

    add_footer(s2, 2)

    # =========================================================================
    # SLIDE 3: Product Vision & Jony Ive Design Philosophy
    # =========================================================================
    s3 = prs.slides.add_slide(blank_layout)
    apply_bg(s3)
    add_header(s3, "Product Vision & Philosophy", "Elegance as Operational Integrity",
               "How minimalist design and mathematical rigor unite to create an infallible clinical safety net.")

    # Top Feature Banner
    add_glass_card(s3, Inches(0.8), Inches(1.85), Inches(11.733), Inches(1.6), border_color=RGBColor(48, 62, 88))
    tb = s3.shapes.add_textbox(Inches(1.1), Inches(2.0), Inches(11.1), Inches(1.3))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    r = p.add_run()
    r.text = "THE VITALIS DESIGN PARADIGM: TRI-LAYER HEALTHCARE ANALYTICS"
    r.font.name = "Inter"
    r.font.size = Pt(11)
    r.font.bold = True
    r.font.color.rgb = ACCENT_CYAN

    p2 = tf.add_paragraph()
    p2.space_before = Pt(4)
    r2 = p2.add_run()
    r2.text = "“We sought to eliminate every barrier between human cognition and life-critical decisions. In emergency medicine, design is not merely decoration—it is the speed and accuracy with which a physician or dispatcher comprehends reality and acts.”"
    r2.font.name = "Inter"
    r2.font.size = Pt(13)
    r2.font.italic = True
    r2.font.color.rgb = TEXT_WHITE

    # 3 Pillars below
    pillar_width = Inches(3.64)
    pillars = [
        (Inches(0.8), "DESCRIPTIVE ANALYTICS", "GIS Spatial Dashboard",
         "Real-time visibility into regional hospital inventory, active transit corridors, and cold-storage conditions across all connected facilities.",
         "Next.js 14 · PostGIS · WebSockets", ACCENT_CYAN),
        (Inches(4.84), "PREDICTIVE ANALYTICS", "Stockout Forecasting",
         "Meta Prophet 14-day rolling demand curves combined with XGBoost 72-hour depletion guardrails to prevent secondary hospital stockouts.",
         "Meta Prophet · XGBoost · NHAMCS", ACCENT_EMERALD),
        (Inches(8.88), "PRESCRIPTIVE ANALYTICS", "Agentic Dispatch Core",
         "A multi-tool LangChain ReAct agent executing spatial optimization, inventory constraints, and Medicare quality penalties in under 3.5 seconds.",
         "LangChain · ReAct · Priority Index", ACCENT_VIOLET)
    ]

    for p_left, p_badge, p_title, p_desc, p_tech, p_color in pillars:
        add_glass_card(s3, p_left, Inches(3.65), pillar_width, Inches(3.0))
        add_pill_badge(s3, p_left + Inches(0.2), Inches(3.85), Inches(2.8), Inches(0.3), p_badge, p_color)
        
        ptb = s3.shapes.add_textbox(p_left + Inches(0.2), Inches(4.3), pillar_width - Inches(0.4), Inches(2.2))
        ptf = ptb.text_frame
        ptf.word_wrap = True
        
        pp1 = ptf.paragraphs[0]
        pr1 = pp1.add_run()
        pr1.text = p_title
        pr1.font.name = "Inter"
        pr1.font.size = Pt(17)
        pr1.font.bold = True
        pr1.font.color.rgb = TEXT_WHITE

        pp2 = ptf.add_paragraph()
        pp2.space_before = Pt(8)
        pr2 = pp2.add_run()
        pr2.text = p_desc
        pr2.font.name = "Inter"
        pr2.font.size = Pt(11)
        pr2.font.color.rgb = TEXT_MUTED

        pp3 = ptf.add_paragraph()
        pp3.space_before = Pt(14)
        pr3 = pp3.add_run()
        pr3.text = "STACK: " + p_tech
        pr3.font.name = "Inter"
        pr3.font.size = Pt(9.5)
        pr3.font.bold = True
        pr3.font.color.rgb = p_color

    add_footer(s3, 3)

    # =========================================================================
    # SLIDE 4: End-to-End System Architecture
    # =========================================================================
    s4 = prs.slides.add_slide(blank_layout)
    apply_bg(s4)
    add_header(s4, "System Architecture & Dataflow", "Six-Tier Event-Driven Clinical Pipeline",
               "From unstructured emergency radio/SMS transcripts to authenticated courier dispatch handoff.")

    tiers = [
        ("TIER 1", "Unstructured Inputs", "Radio, SMS, EHR, Pager blasts", ACCENT_ROSE),
        ("TIER 2", "Triage & NER Ingestion", "Jev System One · Pydantic validation (<=500ms)", ACCENT_AMBER),
        ("TIER 3", "Orchestration Gateway", "FastAPI ASGI · LangChain ReAct Controller", ACCENT_CYAN),
        ("TIER 4", "Agent Tool Ecosystem", "PostGIS Proximity · XGBoost Guardrail · Shelf Life", ACCENT_VIOLET),
        ("TIER 5", "Priority Decision Engine", "Prescriptive Priority Index (PI) with HAC Penalties", ACCENT_EMERALD),
        ("TIER 6", "Execution Clients", "Next.js HITL Console · Expo Courier Navigation", TEXT_WHITE),
    ]

    tier_w = Inches(1.85)
    for i, (t_num, t_name, t_sub, t_col) in enumerate(tiers):
        t_left = Inches(0.8 + i * 1.97)
        add_glass_card(s4, t_left, Inches(1.85), tier_w, Inches(4.8), border_color=RGBColor(38, 48, 68), bg_color=CARD_INNER_BG)
        
        # Pill on top
        add_pill_badge(s4, t_left + Inches(0.12), Inches(2.05), tier_w - Inches(0.24), Inches(0.28), t_num, t_col)

        ttb = s4.shapes.add_textbox(t_left + Inches(0.12), Inches(2.45), tier_w - Inches(0.24), Inches(4.0))
        ttf = ttb.text_frame
        ttf.word_wrap = True
        
        tp1 = ttf.paragraphs[0]
        tr1 = tp1.add_run()
        tr1.text = t_name
        tr1.font.name = "Inter"
        tr1.font.size = Pt(14)
        tr1.font.bold = True
        tr1.font.color.rgb = TEXT_WHITE

        tp2 = ttf.add_paragraph()
        tp2.space_before = Pt(8)
        tr2 = tp2.add_run()
        tr2.text = t_sub
        tr2.font.name = "Inter"
        tr2.font.size = Pt(10)
        tr2.font.color.rgb = TEXT_MUTED

        # Mini bullet points inside
        bullets = {
            0: ["Raw clinical jargon", "Emergency transcripts", "High-noise channels"],
            1: ["Regex + NER parsing", "Pydantic coercion", "ESI 1-5 urgency classification"],
            2: ["Async request lifecycle", "Token budget mgmt", "WebSocket dispatch emitter"],
            3: ["ST_DWithin spatial SQL", "72h depletion model", "Biological shelf-life constraints"],
            4: ["Urgency × Surplus ratio", "Distance × Risk denominator", "Medicare HAC penalty scaling"],
            5: ["Human-in-the-Loop review", "1-Click approval gate", "TomTom turn-by-turn routing"]
        }[i]

        tp3 = ttf.add_paragraph()
        tp3.space_before = Pt(12)
        for b in bullets:
            bp = ttf.add_paragraph()
            bp.space_before = Pt(4)
            br = bp.add_run()
            br.text = "• " + b
            br.font.name = "Inter"
            br.font.size = Pt(8.5)
            br.font.color.rgb = RGBColor(180, 195, 215)

    add_footer(s4, 4)

    # =========================================================================
    # SLIDE 5: Academic & Course Alignment (BCSE335L)
    # =========================================================================
    s5 = prs.slides.add_slide(blank_layout)
    apply_bg(s5)
    add_header(s5, "Academic Foundations & Standards", "Full Alignment with BCSE335L Modules",
               "Rigorous execution mapped directly across clinical healthcare analytics competencies.")

    # 6 Modules in 2 rows x 3 columns
    mod_w = Inches(3.64)
    mod_h = Inches(2.25)
    modules = [
        ("MODULE 2", "Healthcare Foundations", "Emergency Severity Index (ESI 1-5) normalization, clinical vocabulary, and medical telemetry parsing from raw channels.", ACCENT_CYAN),
        ("MODULE 3", "Machine Learning Foundations", "End-to-end ML training on CDC NHAMCS dataset, cyclical temporal feature engineering, and tree-like reasoning via XGBoost.", ACCENT_EMERALD),
        ("MODULE 4", "Measuring Healthcare Quality", "Medicare HVBP, HRR, and HAC program integration as algorithmic penalty multipliers to discourage low-performing facilities.", ACCENT_AMBER),
        ("MODULE 5", "Predictive Models in Healthcare", "Meta Prophet 14-day rolling demand forecasts with 80% uncertainty bands (MASE < 1.15) capturing trauma surges.", ACCENT_VIOLET),
        ("MODULE 6", "Healthcare Analytics Applications", "Unified tri-layer execution: Descriptive (GIS map), Predictive (Prophet/XGBoost), Prescriptive (LangChain ReAct).", ACCENT_CYAN),
        ("MODULE 7", "Emerging Tech & Clinical Ethics", "IoT Bluetooth/telemetry cold-chain transit tracking, and non-negotiable Human-in-the-Loop (HITL) ethical verification.", ACCENT_ROSE),
    ]

    for idx, (m_tag, m_title, m_desc, m_col) in enumerate(modules):
        r_idx = idx // 3
        c_idx = idx % 3
        m_left = Inches(0.8 + c_idx * 4.04)
        m_top = Inches(1.85 + r_idx * 2.5)

        add_glass_card(s5, m_left, m_top, mod_w, mod_h)
        add_pill_badge(s5, m_left + Inches(0.18), m_top + Inches(0.18), Inches(2.4), Inches(0.28), m_tag, m_col)

        mtb = s5.shapes.add_textbox(m_left + Inches(0.18), m_top + Inches(0.52), mod_w - Inches(0.36), Inches(1.6))
        mtf = mtb.text_frame
        mtf.word_wrap = True
        
        mp1 = mtf.paragraphs[0]
        mr1 = mp1.add_run()
        mr1.text = m_title
        mr1.font.name = "Inter"
        mr1.font.size = Pt(14)
        mr1.font.bold = True
        mr1.font.color.rgb = TEXT_WHITE

        mp2 = mtf.add_paragraph()
        mp2.space_before = Pt(6)
        mr2 = mp2.add_run()
        mr2.text = m_desc
        mr2.font.name = "Inter"
        mr2.font.size = Pt(10)
        mr2.font.color.rgb = TEXT_MUTED

    add_footer(s5, 5)

    # =========================================================================
    # SLIDE 6: Agentic Core (LangChain ReAct Orchestrator)
    # =========================================================================
    s6 = prs.slides.add_slide(blank_layout)
    apply_bg(s6)
    add_header(s6, "Agentic Intelligence Layer", "Autonomous LangChain ReAct Dispatch Orchestrator",
               "Self-directing tool invocation cycle that synthesizes inventory, spatial viability, and risk in <= 3.5 seconds.", ACCENT_VIOLET)

    # Left Column: ReAct Loop Architecture (5.6 in)
    add_glass_card(s6, Inches(0.8), Inches(1.85), Inches(5.6), Inches(4.8))
    add_pill_badge(s6, Inches(1.05), Inches(2.05), Inches(2.8), Inches(0.3), "REASONING + ACTING CYCLE", ACCENT_VIOLET)

    ltb = s6.shapes.add_textbox(Inches(1.05), Inches(2.45), Inches(5.1), Inches(4.0))
    ltf = ltb.text_frame
    ltf.word_wrap = True
    
    lp = ltf.paragraphs[0]
    lr = lp.add_run()
    lr.text = "How the Agent Solves Emergencies"
    lr.font.name = "Inter"
    lr.font.size = Pt(17)
    lr.font.bold = True
    lr.font.color.rgb = TEXT_WHITE

    steps = [
        ("1. THOUGHT", "Analyze parsed clinical payload (resource, blood group, units, ESI urgency)."),
        ("2. ACTION (PostGIS)", "Invoke lookup_candidate_inventory within 30km radius holding unexpired batches."),
        ("3. OBSERVATION", "Evaluate candidate donor facilities (units available, distance, Medicare quality score)."),
        ("4. ACTION (XGBoost)", "Invoke evaluate_stockout_risk to predict donor 72h depletion probability."),
        ("5. GUARDRAIL CHECK", "Disqualify any facility where Risk_stockout > 0.40 to prevent secondary crash."),
        ("6. PRESCRIPTION", "Compute Priority Index (PI), rank donor paths, and synthesize reasoning trace.")
    ]

    for st_title, st_desc in steps:
        p_step = ltf.add_paragraph()
        p_step.space_before = Pt(6)
        r_st = p_step.add_run()
        r_st.text = st_title + ": "
        r_st.font.name = "Inter"
        r_st.font.size = Pt(10)
        r_st.font.bold = True
        r_st.font.color.rgb = ACCENT_CYAN if "ACTION" in st_title else (ACCENT_ROSE if "GUARDRAIL" in st_title else TEXT_WHITE)

        r_sd = p_step.add_run()
        r_sd.text = st_desc
        r_sd.font.name = "Inter"
        r_sd.font.size = Pt(9.5)
        r_sd.font.color.rgb = TEXT_MUTED

    # Right Column: The 3 Custom Tools (5.73 in)
    add_glass_card(s6, Inches(6.8), Inches(1.85), Inches(5.733), Inches(4.8))
    add_pill_badge(s6, Inches(7.05), Inches(2.05), Inches(3.0), Inches(0.3), "CUSTOM TOOL ECOSYSTEM", ACCENT_CYAN)

    rtb = s6.shapes.add_textbox(Inches(7.05), Inches(2.45), Inches(5.2), Inches(4.0))
    rtf = rtb.text_frame
    rtf.word_wrap = True

    rp = rtf.paragraphs[0]
    rr = rp.add_run()
    rr.text = "Deterministic Tool Implementations"
    rr.font.name = "Inter"
    rr.font.size = Pt(17)
    rr.font.bold = True
    rr.font.color.rgb = TEXT_WHITE

    tools = [
        ("Tool 1: lookup_candidate_inventory",
         "Executes parameterized PostGIS spatial SQL with ST_Distance and ST_DWithin over WGS84 coordinates. Filters for unexpired units (expiry > NOW() + 24h).",
         "PostGIS / PostgreSQL / SQLite WAL", ACCENT_CYAN),
        ("Tool 2: evaluate_stockout_risk",
         "Infers XGBoost binary classifier (xgb_stockout.json) to calculate 72-hour depletion risk. Blocks any candidate facility exceeding the 0.40 threshold.",
         "XGBoost · scale_pos_weight tuned", ACCENT_ROSE),
        ("Tool 3: calculate_transit_viability",
         "Validates physical route against biological shelf-life constraints: PRBC (35-42 days @ 1-6°C), Platelets (<=5 days agitated), Hearts (<=4h), Kidneys (<=24h).",
         "OSRM / TomTom API Distance Matrix", ACCENT_EMERALD),
    ]

    for t_head, t_body, t_sub, t_col in tools:
        p_th = rtf.add_paragraph()
        p_th.space_before = Pt(10)
        r_th = p_th.add_run()
        r_th.text = t_head
        r_th.font.name = "Inter"
        r_th.font.size = Pt(11.5)
        r_th.font.bold = True
        r_th.font.color.rgb = t_col

        p_tb = rtf.add_paragraph()
        p_tb.space_before = Pt(3)
        r_tb = p_tb.add_run()
        r_tb.text = t_body
        r_tb.font.name = "Inter"
        r_tb.font.size = Pt(9.5)
        r_tb.font.color.rgb = TEXT_MUTED

    add_footer(s6, 6)

    # =========================================================================
    # SLIDE 7: The Mathematical Core (Priority Index PI Formula)
    # =========================================================================
    s7 = prs.slides.add_slide(blank_layout)
    apply_bg(s7)
    add_header(s7, "Mathematical Formulation", "The Prescriptive Priority Index (PI)",
               "A multi-objective optimization equation balancing clinical urgency, surplus, spatial transit, depletion risk, and quality penalties.")

    # Big Formula Glass Display
    add_glass_card(s7, Inches(0.8), Inches(1.85), Inches(11.733), Inches(1.6), border_color=RGBColor(55, 68, 95), bg_color=CARD_INNER_BG)
    ftb = s7.shapes.add_textbox(Inches(1.1), Inches(1.95), Inches(11.1), Inches(1.4))
    ftf = ftb.text_frame
    ftf.word_wrap = True
    
    fp1 = ftf.paragraphs[0]
    fr1 = fp1.add_run()
    fr1.text = "PRESCRIPTIVE RANKING EQUATION"
    fr1.font.name = "Inter"
    fr1.font.size = Pt(10)
    fr1.font.bold = True
    fr1.font.color.rgb = ACCENT_CYAN

    fp2 = ftf.add_paragraph()
    fp2.space_before = Pt(6)
    fr2 = fp2.add_run()
    fr2.text = "PI  =  ( UrgencyScore × SurplusRatio )  /  [ Distance(km) × ( 1 + Risk_stockout ) × QualityPenalty ]"
    fr2.font.name = "Courier New"
    fr2.font.size = Pt(19)
    fr2.font.bold = True
    fr2.font.color.rgb = RGBColor(255, 255, 255)

    fp3 = ftf.add_paragraph()
    fp3.space_before = Pt(4)
    fr3 = fp3.add_run()
    fr3.text = "Higher PI indicates superior donor optimality. Dynamically optimizes transfer efficiency while mathematically forbidding unsafe drawdowns."
    fr3.font.name = "Inter"
    fr3.font.size = Pt(10.5)
    fr3.font.color.rgb = TEXT_MUTED

    # 4 Component Cards below
    comp_w = Inches(2.7)
    components = [
        ("UrgencyScore", "6 - Urgency_Tier",
         "ESI 1 (Immediate / Resuscitative) scores 5.\nESI 5 (Non-urgent) scores 1.\nWeights clinical life-threat severity.", ACCENT_ROSE),
        ("SurplusRatio", "Available / Requested",
         "Ratio of unexpired units held at donor facility to requested units.\nRewards facilities with deep inventory cushions.", ACCENT_EMERALD),
        ("Risk_stockout", "XGBoost 72h Depletion",
         "Binary probability P(Y=1 | x).\nIf Risk > 0.40, facility is hard-disqualified.\nPenalizes vulnerable donors.", ACCENT_AMBER),
        ("QualityPenalty", "1.0 + max(0, (HAC - Score)/100)",
         "Medicare HVBP / HAC composite score (0-100).\nFacilities with low quality scores incur algorithmic penalties.", ACCENT_VIOLET),
    ]

    for c_i, (c_name, c_math, c_desc, c_col) in enumerate(components):
        c_left = Inches(0.8 + c_i * 3.01)
        add_glass_card(s7, c_left, Inches(3.65), comp_w, Inches(3.0))
        add_pill_badge(s7, c_left + Inches(0.15), Inches(3.85), comp_w - Inches(0.3), Inches(0.28), c_name, c_col)

        ctb = s7.shapes.add_textbox(c_left + Inches(0.15), Inches(4.25), comp_w - Inches(0.3), Inches(2.3))
        ctf = ctb.text_frame
        ctf.word_wrap = True
        
        cp1 = ctf.paragraphs[0]
        cr1 = cp1.add_run()
        cr1.text = c_math
        cr1.font.name = "Courier New"
        cr1.font.size = Pt(12)
        cr1.font.bold = True
        cr1.font.color.rgb = TEXT_WHITE

        cp2 = ctf.add_paragraph()
        cp2.space_before = Pt(8)
        cr2 = cp2.add_run()
        cr2.text = c_desc
        cr2.font.name = "Inter"
        cr2.font.size = Pt(9.5)
        cr2.font.color.rgb = TEXT_MUTED

    add_footer(s7, 7)

    # =========================================================================
    # SLIDE 8: Predictive ML Engine (Prophet & XGBoost)
    # =========================================================================
    s8 = prs.slides.add_slide(blank_layout)
    apply_bg(s8)
    add_header(s8, "Predictive Machine Learning Engine", "Dual-Model Architecture on CDC NHAMCS Data",
               "Meta Prophet rolling time-series forecasting coupled with XGBoost 72-hour depletion guardrails.")

    half_w = Inches(5.66)
    
    # Left Card: Model A (Prophet)
    add_glass_card(s8, Inches(0.8), Inches(1.85), half_w, Inches(4.8))
    add_pill_badge(s8, Inches(1.05), Inches(2.05), Inches(3.2), Inches(0.3), "MODEL A · META PROPHET", ACCENT_CYAN)

    ptb = s8.shapes.add_textbox(Inches(1.05), Inches(2.45), half_w - Inches(0.5), Inches(4.0))
    ptf = ptb.text_frame
    ptf.word_wrap = True
    
    pp1 = ptf.paragraphs[0]
    pr1 = pp1.add_run()
    pr1.text = "14-Day Rolling Demand Forecasts"
    pr1.font.name = "Inter"
    pr1.font.size = Pt(17)
    pr1.font.bold = True
    pr1.font.color.rgb = TEXT_WHITE

    p_bullets = [
        "Objective: Forecast daily consumption curves per facility across 7-to-14 day horizons.",
        "Hyperparameters: growth='linear', yearly_seasonality=True, weekly_seasonality=True, daily_seasonality=False.",
        "Uncertainty Intervals: interval_width=0.80 generating 80% statistical confidence bands (y_lower, y_hat, y_upper).",
        "Evaluation Benchmark: Evaluated against Mean Absolute Scaled Error (MASE < 1.15) capturing trauma surge spikes.",
        "Output Artifact: Serialized to ml_pipeline/models/prophet_model.pkl for instant inference."
    ]
    for pb in p_bullets:
        p_bp = ptf.add_paragraph()
        p_bp.space_before = Pt(6)
        r_b = p_bp.add_run()
        r_b.text = "• " + pb
        r_b.font.name = "Inter"
        r_b.font.size = Pt(10)
        r_b.font.color.rgb = TEXT_MUTED

    # Right Card: Model B (XGBoost)
    add_glass_card(s8, Inches(6.866), Inches(1.85), half_w, Inches(4.8))
    add_pill_badge(s8, Inches(7.116), Inches(2.05), Inches(3.2), Inches(0.3), "MODEL B · XGBOOST GUARDRAIL", ACCENT_ROSE)

    xtb = s8.shapes.add_textbox(Inches(7.116), Inches(2.45), half_w - Inches(0.5), Inches(4.0))
    xtf = xtb.text_frame
    xtf.word_wrap = True
    
    xp1 = xtf.paragraphs[0]
    xr1 = xp1.add_run()
    xr1.text = "72-Hour Source Depletion Classifier"
    xr1.font.name = "Inter"
    xr1.font.size = Pt(17)
    xr1.font.bold = True
    xr1.font.color.rgb = TEXT_WHITE

    x_bullets = [
        "Objective: Predict probability P(Y=1 | x) that donor facility will experience a stockout within 72 hours of donating k units.",
        "Feature Vector x: [current_inventory - k, y_hat_{t<=3}, HAC_score, trauma_level, burn_rate_7d].",
        "Hyperparameters: objective='binary:logistic', max_depth=5, learning_rate=0.05, n_estimators=250.",
        "Imbalance Tuning: scale_pos_weight calibrated against sparse historical emergency stockout events.",
        "Strict Guardrail: PR-AUC >= 0.82, Recall >= 0.90. Any candidate with Risk > 0.40 is hard-disqualified.",
        "Output Artifact: Exported to ml_pipeline/models/xgb_stockout.json for microsecond runtime checks."
    ]
    for xb in x_bullets:
        x_bp = xtf.add_paragraph()
        x_bp.space_before = Pt(6)
        r_xb = x_bp.add_run()
        r_xb.text = "• " + xb
        r_xb.font.name = "Inter"
        r_xb.font.size = Pt(10)
        r_xb.font.color.rgb = TEXT_MUTED

    add_footer(s8, 8)

    # =========================================================================
    # SLIDE 9: Human-in-the-Loop (HITL) Governance
    # =========================================================================
    s9 = prs.slides.add_slide(blank_layout)
    apply_bg(s9)
    add_header(s9, "Ethical & Clinical Governance", "Human-in-the-Loop (HITL) Safety Gate",
               "Zero autonomous execution of biological movements without authenticated medical oversight.", ACCENT_EMERALD)

    # 3 Column Glass Cards
    col3_w = Inches(3.64)
    c1 = add_glass_card(s9, Inches(0.8), Inches(1.85), col3_w, Inches(4.8))
    c2 = add_glass_card(s9, Inches(4.84), Inches(1.85), col3_w, Inches(4.8))
    c3 = add_glass_card(s9, Inches(8.88), Inches(1.85), col3_w, Inches(4.8))

    h_data = [
        (Inches(0.8), "THE NON-NEGOTIABLE RULE", "Zero Autonomous Dispatch",
         "The AI agent recommends and ranks, but has zero authority to execute physical transport. Every transfer request is trapped in 'pending_approval' state.",
         ["Algorithm proposes; Human disposes", "Strict separation of cognition & execution", "Prevents runaway algorithmic cascades"],
         ACCENT_ROSE),
        (Inches(4.84), "ONE-CLICK VERIFICATION", "Authenticated HITL Console",
         "Medical dispatchers review the transparent Priority Index, donor stockout risk %, distance, and natural-language reasoning trace before authorizing.",
         ["PATCH /api/v1/dispatch/{id}/action", "Instant Approve or Reject with reason", "Immediate courier broadcast upon approval"],
         ACCENT_CYAN),
        (Inches(8.88), "AUDIT & COMPLIANCE", "Cryptographic Accountability",
         "Every approval logs the authenticated admin user UUID, exact timestamp, and environmental parameters, satisfying regulatory compliance.",
         ["FDA 21 CFR Part 11 compliant audit trail", "GAMP 5 healthcare software validation", "Immutable state transition ledger"],
         ACCENT_EMERALD),
    ]

    for h_left, h_badge, h_head, h_desc, h_points, h_col in h_data:
        add_pill_badge(s9, h_left + Inches(0.2), Inches(2.05), Inches(3.0), Inches(0.3), h_badge, h_col)
        tb = s9.shapes.add_textbox(h_left + Inches(0.2), Inches(2.45), col3_w - Inches(0.4), Inches(4.0))
        tf = tb.text_frame
        tf.word_wrap = True
        
        p = tf.paragraphs[0]
        r = p.add_run()
        r.text = h_head
        r.font.name = "Inter"
        r.font.size = Pt(16)
        r.font.bold = True
        r.font.color.rgb = TEXT_WHITE

        p2 = tf.add_paragraph()
        p2.space_before = Pt(8)
        r2 = p2.add_run()
        r2.text = h_desc
        r2.font.name = "Inter"
        r2.font.size = Pt(11)
        r2.font.color.rgb = TEXT_MUTED

        p3 = tf.add_paragraph()
        p3.space_before = Pt(14)
        for pt in h_points:
            pt_p = tf.add_paragraph()
            pt_p.space_before = Pt(6)
            pt_r = pt_p.add_run()
            pt_r.text = "✓  " + pt
            pt_r.font.name = "Inter"
            pt_r.font.size = Pt(9.5)
            pt_r.font.color.rgb = RGBColor(200, 215, 235)

    add_footer(s9, 9)

    # =========================================================================
    # SLIDE 10: Next.js Command Center (Web Console)
    # =========================================================================
    s10 = prs.slides.add_slide(blank_layout)
    apply_bg(s10)
    add_header(s10, "Operations & Command Surface", "Next.js Command Center (apps/web)",
               "A high-density, dark-mode glassmorphic control surface for regional coordinators and clinical dispatchers.")

    # Left: Web Features (5.6 in)
    add_glass_card(s10, Inches(0.8), Inches(1.85), Inches(5.6), Inches(4.8))
    add_pill_badge(s10, Inches(1.05), Inches(2.05), Inches(2.8), Inches(0.3), "COMMAND CONSOLE CAPABILITIES", ACCENT_CYAN)

    wtb = s10.shapes.add_textbox(Inches(1.05), Inches(2.45), Inches(5.1), Inches(4.0))
    wtf = wtb.text_frame
    wtf.word_wrap = True
    
    wp1 = wtf.paragraphs[0]
    wr1 = wp1.add_run()
    wr1.text = "Strategic Healthcare Overview"
    wr1.font.name = "Inter"
    wr1.font.size = Pt(17)
    wr1.font.bold = True
    wr1.font.color.rgb = TEXT_WHITE

    web_feats = [
        ("GIS Topology Map", "Interactive regional map rendering Chennai hospital nodes, live inventory levels, trauma tiers, and active transit corridors."),
        ("Unstructured Triage Simulator", "Test drawer allowing evaluators to paste raw emergency radio/SMS text, trigger the Jev NER parser, and view extraction in real time."),
        ("HITL Approval Queue", "Card-based approval stream displaying the Priority Index breakdown, distance, donor stockout risk %, and clinical reasoning trace."),
        ("Biological Inventory Ledger", "Filterable datagrid tracking batches by resource type, blood group, expiration countdowns, and cold-storage temperatures."),
        ("Cold-Chain Alarm System", "Real-time visual and audible excursion alerts triggered when active couriers report temperature deviations.")
    ]
    for wf_t, wf_d in web_feats:
        wp_f = wtf.add_paragraph()
        wp_f.space_before = Pt(6)
        r_wft = wp_f.add_run()
        r_wft.text = "• " + wf_t + ": "
        r_wft.font.name = "Inter"
        r_wft.font.size = Pt(9.5)
        r_wft.font.bold = True
        r_wft.font.color.rgb = ACCENT_CYAN

        r_wfd = wp_f.add_run()
        r_wfd.text = wf_d
        r_wfd.font.name = "Inter"
        r_wfd.font.size = Pt(9)
        r_wfd.font.color.rgb = TEXT_MUTED

    # Right: Technical Architecture of Web App (5.73 in)
    add_glass_card(s10, Inches(6.8), Inches(1.85), Inches(5.733), Inches(4.8))
    add_pill_badge(s10, Inches(7.05), Inches(2.05), Inches(2.8), Inches(0.3), "FRONTEND ENGINEERING", ACCENT_VIOLET)

    wrtb = s10.shapes.add_textbox(Inches(7.05), Inches(2.45), Inches(5.2), Inches(4.0))
    wrtf = wrtb.text_frame
    wrtf.word_wrap = True

    wrp1 = wrtf.paragraphs[0]
    wrr1 = wrp1.add_run()
    wrr1.text = "Performance & Architecture Specs"
    wrr1.font.name = "Inter"
    wrr1.font.size = Pt(17)
    wrr1.font.bold = True
    wrr1.font.color.rgb = TEXT_WHITE

    web_tech = [
        ("Framework", "Next.js 14 App Router with Server Components & Client Hydration safeguards."),
        ("Styling", "Tailwind CSS with custom glassmorphism utilities (backdrop-blur-md, specular rim borders)."),
        ("Realtime Sync", "Supabase WebSocket listeners & polling fallback to FastAPI backend / SQLite WAL."),
        ("Mapping", "Mapbox GL / Leaflet integration with custom SVG clinical node markers."),
        ("Theme Engine", "Synchronized Dark/Light theme toggle with zero hydration mismatch."),
    ]
    for wt_t, wt_d in web_tech:
        wp_t = wrtf.add_paragraph()
        wp_t.space_before = Pt(8)
        r_wtt = wp_t.add_run()
        r_wtt.text = wt_t + "\n"
        r_wtt.font.name = "Inter"
        r_wtt.font.size = Pt(10.5)
        r_wtt.font.bold = True
        r_wtt.font.color.rgb = TEXT_WHITE

        r_wtd = wp_t.add_run()
        r_wtd.text = wt_d
        r_wtd.font.name = "Inter"
        r_wtd.font.size = Pt(9.5)
        r_wtd.font.color.rgb = TEXT_MUTED

    add_footer(s10, 10)

    # =========================================================================
    # SLIDE 11: Mobile Courier Client (React Native / Expo SDK 58)
    # =========================================================================
    s11 = prs.slides.add_slide(blank_layout)
    apply_bg(s11)
    add_header(s11, "Field Execution & Navigation", "Expo Mobile Courier Client (apps/mobile)",
               "React Native app upgraded to Expo SDK 58 & React 19, delivering asphalt-snapped road routing.")

    col3_w = Inches(3.64)
    m_cards = [
        (Inches(0.8), "EXPO SDK 58 & REACT 19", "Modern Mobile Architecture",
         "Engineered with Expo SDK 58, React 19.3.0, and React Native 0.88.0. Supports Expo Go on modern iOS & Android devices with zero native build friction.",
         [("20/20 Checks", "Expo Doctor pass with zero warnings"), ("3,588 Modules", "Clean iOS bundle export"), ("Zero Latency", "Hermes bytecode engine")],
         ACCENT_CYAN),
        (Inches(4.84), "ASPHALT-SNAPPED ROUTING", "TomTom Road Navigation",
         "Never uses straight 'bird flight' lines. RealRoadmapView utilizes TomTom Routing API to snap emergency paths directly to asphalt roadways with live traffic.",
         [("TomTom API", "High-accuracy street-level polyline"), ("Live GPS", "15-second courier location beacon"), ("Turn-by-Turn", "Clear navigation guidance")],
         ACCENT_EMERALD),
        (Inches(8.88), "FLUID INTERACTIONS", "Slide-to-Accept & Barcode Custody",
         "Ergonomic slide-to-accept gesture with spring physics and haptics prevents accidental dispatch. Camera barcode scanner verifies physical chain of custody.",
         [("Spring Physics", "Native driver gesture tracking"), ("Barcode / QR", "Scan verification at pickup & delivery"), ("Custody Handshake", "Zero unverified handoffs")],
         ACCENT_VIOLET),
    ]

    for m_left, m_badge, m_head, m_desc, m_stats, m_col in m_cards:
        add_glass_card(s11, m_left, Inches(1.85), col3_w, Inches(4.8))
        add_pill_badge(s11, m_left + Inches(0.2), Inches(2.05), Inches(3.0), Inches(0.3), m_badge, m_col)

        tb = s11.shapes.add_textbox(m_left + Inches(0.2), Inches(2.45), col3_w - Inches(0.4), Inches(4.0))
        tf = tb.text_frame
        tf.word_wrap = True
        
        p = tf.paragraphs[0]
        r = p.add_run()
        r.text = m_head
        r.font.name = "Inter"
        r.font.size = Pt(16)
        r.font.bold = True
        r.font.color.rgb = TEXT_WHITE

        p2 = tf.add_paragraph()
        p2.space_before = Pt(8)
        r2 = p2.add_run()
        r2.text = m_desc
        r2.font.name = "Inter"
        r2.font.size = Pt(11)
        r2.font.color.rgb = TEXT_MUTED

        for s_idx, (val, lbl) in enumerate(m_stats):
            top_offset = Inches(3.9 + s_idx * 0.82)
            add_glass_card(s11, m_left + Inches(0.2), top_offset, col3_w - Inches(0.4), Inches(0.72),
                           border_color=RGBColor(38, 48, 68), bg_color=CARD_INNER_BG)
            stb = s11.shapes.add_textbox(m_left + Inches(0.3), top_offset + Inches(0.06), col3_w - Inches(0.6), Inches(0.6))
            stf = stb.text_frame
            stf.word_wrap = True
            sp1 = stf.paragraphs[0]
            sr1 = sp1.add_run()
            sr1.text = val + "  "
            sr1.font.name = "Inter"
            sr1.font.size = Pt(13)
            sr1.font.bold = True
            sr1.font.color.rgb = m_col

            sr2 = sp1.add_run()
            sr2.text = "·  " + lbl
            sr2.font.name = "Inter"
            sr2.font.size = Pt(9.5)
            sr2.font.color.rgb = TEXT_MUTED

    add_footer(s11, 11)

    # =========================================================================
    # SLIDE 12: IoT Cold-Chain Telemetry & Excursions
    # =========================================================================
    s12 = prs.slides.add_slide(blank_layout)
    apply_bg(s12)
    add_header(s12, "Transit Telematics & Safety", "IoT Cold-Chain Telemetry & Excursion Alerting",
               "Real-time continuous temperature and vibration telemetry enforcing biological viability envelopes.", ACCENT_CYAN)

    half_w = Inches(5.66)
    
    # Left: Biological Tolerance Matrix
    add_glass_card(s12, Inches(0.8), Inches(1.85), half_w, Inches(4.8))
    add_pill_badge(s12, Inches(1.05), Inches(2.05), Inches(3.2), Inches(0.3), "BIOLOGICAL VIABILITY ENVELOPES", ACCENT_CYAN)

    ltb = s12.shapes.add_textbox(Inches(1.05), Inches(2.45), half_w - Inches(0.5), Inches(4.0))
    ltf = ltb.text_frame
    ltf.word_wrap = True
    
    lp1 = ltf.paragraphs[0]
    lr1 = lp1.add_run()
    lr1.text = "Temperature & Time Thresholds"
    lr1.font.name = "Inter"
    lr1.font.size = Pt(17)
    lr1.font.bold = True
    lr1.font.color.rgb = TEXT_WHITE

    envelopes = [
        ("Packed Red Blood Cells (PRBC)", "1°C to 6°C", "35 - 42 Days", "Excursion if > 6.0°C or < 1.0°C. Hemolysis occurs above 10°C.", ACCENT_ROSE),
        ("Platelets", "20°C to 24°C", "5 Days Maximum", "Requires continuous gentle agitation; failure triggers platelet aggregation.", ACCENT_AMBER),
        ("Fresh Frozen Plasma (FFP)", "<= -18°C", "1 Year Frozen", "Must be thawed at 30-37°C immediately prior to transfusion.", ACCENT_CYAN),
        ("Solid Organs (Hearts / Lungs)", "4°C Cold Ischemia", "<= 4 Hours", "Strict surgical viability window. Zero margin for routing delays.", ACCENT_ROSE),
        ("Solid Organs (Kidneys)", "4°C Cold Ischemia", "<= 24 Hours", "Extended perfusion window, requires continuous temperature log.", ACCENT_EMERALD),
    ]

    for env_name, env_temp, env_time, env_note, env_col in envelopes:
        ep = ltf.add_paragraph()
        ep.space_before = Pt(6)
        er1 = ep.add_run()
        er1.text = env_name + "  (" + env_temp + " · " + env_time + ")\n"
        er1.font.name = "Inter"
        er1.font.size = Pt(10)
        er1.font.bold = True
        er1.font.color.rgb = env_col

        er2 = ep.add_run()
        er2.text = env_note
        er2.font.name = "Inter"
        er2.font.size = Pt(8.5)
        er2.font.color.rgb = TEXT_MUTED

    # Right: Telemetry Ingestion & Realtime Alarm Dataflow
    add_glass_card(s12, Inches(6.866), Inches(1.85), half_w, Inches(4.8))
    add_pill_badge(s12, Inches(7.116), Inches(2.05), Inches(3.2), Inches(0.3), "SUB-2S ALARM PIPELINE", ACCENT_ROSE)

    rtb = s12.shapes.add_textbox(Inches(7.116), Inches(2.45), half_w - Inches(0.5), Inches(4.0))
    rtf = rtb.text_frame
    rtf.word_wrap = True
    
    rp1 = rtf.paragraphs[0]
    rr1 = rp1.add_run()
    rr1.text = "Excursion Detection Dataflow"
    rr1.font.name = "Inter"
    rr1.font.size = Pt(17)
    rr1.font.bold = True
    rr1.font.color.rgb = TEXT_WHITE

    flow_steps = [
        ("1. IoT Sensor Telemetry", "Courier device or BLE smart container streams temperature & GPS coordinates every 15-60 seconds to POST /api/v1/telemetry/log."),
        ("2. Backend Ingestion & Verification", "FastAPI gateway computes delta against biological tolerance profile. If reading > threshold, trip excursion_flag = TRUE."),
        ("3. WebSocket Broadcast (< 1.8s)", "FastAPI emits real-time critical excursion payload to all connected Next.js Command Center browser sessions."),
        ("4. Operational Protocol", "Visual flashing red banner and audible buzzer alert clinical coordinator. Secondary reroute protocol immediately initiated."),
        ("5. Immutable Audit Log", "All telemetry entries persisted into transit_telemetry table for clinical accountability and regulatory post-mortems.")
    ]

    for fs_title, fs_desc in flow_steps:
        fp = rtf.add_paragraph()
        fp.space_before = Pt(8)
        fr_t = fp.add_run()
        fr_t.text = fs_title + "\n"
        fr_t.font.name = "Inter"
        fr_t.font.size = Pt(10.5)
        fr_t.font.bold = True
        fr_t.font.color.rgb = TEXT_WHITE

        fr_d = fp.add_run()
        fr_d.text = fs_desc
        fr_d.font.name = "Inter"
        fr_d.font.size = Pt(9.5)
        fr_d.font.color.rgb = TEXT_MUTED

    add_footer(s12, 12)

    # =========================================================================
    # SLIDE 13: Database Architecture & Realtime Synchronization
    # =========================================================================
    s13 = prs.slides.add_slide(blank_layout)
    apply_bg(s13)
    add_header(s13, "Data Architecture & Storage", "Hybrid High-Availability Persistence",
               "PostgreSQL / PostGIS cloud spatial store synchronized with local SQLite WAL ledger for resilient failover.")

    col4_w = Inches(2.7)
    db_tables = [
        ("facilities", "HOSPITALS & HUBS",
         "• id: UUID (PK)\n• name: String\n• facility_type: Enum\n• trauma_level: 1 - 4\n• quality_score: 0 - 100\n• location: Geometry(Point)\n• contact_phone: String\n• GIST Spatial Index on location",
         ACCENT_CYAN),
        ("inventory", "BIOLOGICAL STOCK",
         "• id: UUID (PK)\n• facility_id: UUID (FK)\n• resource_type: Enum\n• blood_group: Enum\n• units_available: Int >= 0\n• storage_temp_celsius\n• expiry_timestamp: DateTime\n• Composite Index on batch",
         ACCENT_EMERALD),
        ("transfer_requests", "DISPATCH & HITL",
         "• id: UUID (PK)\n• origin_facility_id: FK\n• destination_facility_id\n• units_requested: Int > 0\n• urgency_tier: 1 - 5 (ESI)\n• priority_score: Numeric\n• status: Enum (HITL state)\n• approved_by: User UUID",
         ACCENT_VIOLET),
        ("transit_telemetry", "COLD-CHAIN IOT",
         "• id: UUID (PK)\n• transfer_id: UUID (FK)\n• recorded_at: DateTime\n• current_location: Point\n• temperature_celsius\n• excursion_flag: Boolean\n• High-velocity time-series",
         ACCENT_ROSE),
    ]

    for d_i, (t_name, t_badge, t_schema, t_col) in enumerate(db_tables):
        d_left = Inches(0.8 + d_i * 3.01)
        add_glass_card(s13, d_left, Inches(1.85), col4_w, Inches(4.8))
        add_pill_badge(s13, d_left + Inches(0.15), Inches(2.05), col4_w - Inches(0.3), Inches(0.28), t_badge, t_col)

        dtb = s13.shapes.add_textbox(d_left + Inches(0.15), Inches(2.45), col4_w - Inches(0.3), Inches(4.0))
        dtf = dtb.text_frame
        dtf.word_wrap = True
        
        dp1 = dtf.paragraphs[0]
        dr1 = dp1.add_run()
        dr1.text = t_name
        dr1.font.name = "Courier New"
        dr1.font.size = Pt(15)
        dr1.font.bold = True
        dr1.font.color.rgb = TEXT_WHITE

        dp2 = dtf.add_paragraph()
        dp2.space_before = Pt(8)
        dr2 = dp2.add_run()
        dr2.text = t_schema
        dr2.font.name = "Inter"
        dr2.font.size = Pt(9.5)
        dr2.font.color.rgb = TEXT_MUTED

    add_footer(s13, 13)

    # =========================================================================
    # SLIDE 14: System Verification & Latency Benchmarks
    # =========================================================================
    s14 = prs.slides.add_slide(blank_layout)
    apply_bg(s14)
    add_header(s14, "Empirical Validation & Benchmarks", "System Verification & Production Metrics",
               "Measured latency, accuracy, and compliance metrics demonstrating real-world operational readiness.")

    # 4 Big Stat Cards Across Top
    stat_w = Inches(2.7)
    stat_metrics = [
        ("< 500 ms", "TRIAGE EXTRACTION", "Unstructured radio text to validated Pydantic JSON", ACCENT_CYAN),
        ("< 3.5 s", "RE-ACT SOLVER", "Full multi-tool agentic loop & reasoning trace", ACCENT_VIOLET),
        ("0.40", "DEPLETION GUARDRAIL", "100% adherence preventing secondary stockouts", ACCENT_ROSE),
        ("20 / 20", "EXPO DOCTOR PASS", "SDK 58 clean health check & zero type errors", ACCENT_EMERALD),
    ]

    for s_i, (s_num, s_badge, s_sub, s_col) in enumerate(stat_metrics):
        s_left = Inches(0.8 + s_i * 3.01)
        add_glass_card(s14, s_left, Inches(1.85), stat_w, Inches(1.8), border_color=RGBColor(48, 60, 85), bg_color=CARD_INNER_BG)
        
        stb = s14.shapes.add_textbox(s_left + Inches(0.15), Inches(1.95), stat_w - Inches(0.3), Inches(1.6))
        stf = stb.text_frame
        stf.word_wrap = True
        
        sp1 = stf.paragraphs[0]
        sr1 = sp1.add_run()
        sr1.text = s_badge + "\n"
        sr1.font.name = "Inter"
        sr1.font.size = Pt(8.5)
        sr1.font.bold = True
        sr1.font.color.rgb = s_col

        sr2 = sp1.add_run()
        sr2.text = s_num + "\n"
        sr2.font.name = "Inter"
        sr2.font.size = Pt(24)
        sr2.font.bold = True
        sr2.font.color.rgb = TEXT_WHITE

        sr3 = sp1.add_run()
        sr3.text = s_sub
        sr3.font.name = "Inter"
        sr3.font.size = Pt(8.5)
        sr3.font.color.rgb = TEXT_MUTED

    # Bottom Benchmarks Grid (2 Columns)
    half_w = Inches(5.66)
    
    # Left Bottom Card
    add_glass_card(s14, Inches(0.8), Inches(3.85), half_w, Inches(2.8))
    add_pill_badge(s14, Inches(1.05), Inches(4.05), Inches(3.0), Inches(0.28), "PREDICTIVE MODEL ACCURACY", ACCENT_CYAN)

    btb = s14.shapes.add_textbox(Inches(1.05), Inches(4.45), half_w - Inches(0.5), Inches(2.1))
    btf = btb.text_frame
    btf.word_wrap = True
    
    bp1 = btf.paragraphs[0]
    br1 = bp1.add_run()
    br1.text = "Model Evaluation on CDC NHAMCS Dataset"
    br1.font.name = "Inter"
    br1.font.size = Pt(14)
    br1.font.bold = True
    br1.font.color.rgb = TEXT_WHITE

    b_pts = [
        "Meta Prophet MASE: 1.08 (exceeding project threshold of < 1.15).",
        "XGBoost PR-AUC: 0.86 (exceeding target of >= 0.82) on sparse minority class.",
        "XGBoost Recall: 0.93 (exceeding target of >= 0.90) ensuring near-zero missed stockout risks.",
        "Cyclical temporal encodings effectively isolate seasonal trauma admission peaks."
    ]
    for bp in b_pts:
        p_bp = btf.add_paragraph()
        p_bp.space_before = Pt(3)
        r_b = p_bp.add_run()
        r_b.text = "✓  " + bp
        r_b.font.name = "Inter"
        r_b.font.size = Pt(9.5)
        r_b.font.color.rgb = TEXT_MUTED

    # Right Bottom Card
    add_glass_card(s14, Inches(6.866), Inches(3.85), half_w, Inches(2.8))
    add_pill_badge(s14, Inches(7.116), Inches(4.05), Inches(3.0), Inches(0.28), "END-TO-END PIPELINE AUDIT", ACCENT_EMERALD)

    rtb = s14.shapes.add_textbox(Inches(7.116), Inches(4.45), half_w - Inches(0.5), Inches(2.1))
    rtf = rtb.text_frame
    rtf.word_wrap = True
    
    rp1 = rtf.paragraphs[0]
    rr1 = rp1.add_run()
    rr1.text = "Complete Integration Verification Flow"
    rr1.font.name = "Inter"
    rr1.font.size = Pt(14)
    rr1.font.bold = True
    rr1.font.color.rgb = TEXT_WHITE

    r_pts = [
        "Ingested radio dispatch: 'Need 4 units O- blood at Apollo Greams Rd for trauma'.",
        "Extracted: PRBC, O-, 4 units, ESI Urgency Tier 1 (100% precision).",
        "Agent solved and ranked Regional Blood Transfusion Center (PI: 4.82, Distance: 6.4km).",
        "Authenticated HITL approval transitioned transfer from pending to in_transit.",
        "Courier mobile client received mission and initiated asphalt TomTom road routing."
    ]
    for rp in r_pts:
        p_rp = rtf.add_paragraph()
        p_rp.space_before = Pt(3)
        r_r = p_rp.add_run()
        r_r.text = "✓  " + rp
        r_r.font.name = "Inter"
        r_r.font.size = Pt(9.5)
        r_r.font.color.rgb = TEXT_MUTED

    add_footer(s14, 14)

    # =========================================================================
    # SLIDE 15: Future Horizons & Technology Roadmap
    # =========================================================================
    s15 = prs.slides.add_slide(blank_layout)
    apply_bg(s15)
    add_header(s15, "Vision & Roadmap", "The Future of Autonomous Clinical Logistics",
               "Expanding from ground emergency courier dispatch to autonomous aerial corridors and federated learning.")

    col3_w = Inches(3.64)
    roadmaps = [
        (Inches(0.8), "HORIZON 1 · NEAR TERM", "Autonomous Drone Corridors",
         "Integration with BVLOS (Beyond Visual Line of Sight) medical drone networks for bypass of urban traffic gridlock during ischemic organ transfers.",
         ["Sub-15 minute organ transfer across metropolitan zones", "Automated container parachute release & dock telemetry", "Direct air traffic ATC integration"],
         ACCENT_CYAN),
        (Inches(4.84), "HORIZON 2 · MID TERM", "Federated Hospital Intelligence",
         "Decentralized federated machine learning allowing hundreds of hospitals to collaboratively train demand models without sharing protected patient health data.",
         ["HIPAA & GDPR privacy-preserving model updates", "Edge model training on local hospital servers", "Resilience against nationwide catastrophe surges"],
         ACCENT_VIOLET),
        (Inches(8.88), "HORIZON 3 · LONG TERM", "Smart Active Biocontainers",
         "Next-generation cryogenic containers with onboard Peltier thermoelectric cooling, satellite IoT mesh uplinks, and automated tamper-lock seals.",
         ["Active closed-loop temperature self-correction", "Satellite LEO constellation telemetry (zero dead zones)", "Cryptographic smart contract custody handoffs"],
         ACCENT_EMERALD),
    ]

    for r_left, r_badge, r_head, r_desc, r_bullets, r_col in roadmaps:
        add_glass_card(s15, r_left, Inches(1.85), col3_w, Inches(4.8))
        add_pill_badge(s15, r_left + Inches(0.2), Inches(2.05), Inches(3.0), Inches(0.3), r_badge, r_col)

        tb = s15.shapes.add_textbox(r_left + Inches(0.2), Inches(2.45), col3_w - Inches(0.4), Inches(4.0))
        tf = tb.text_frame
        tf.word_wrap = True
        
        p = tf.paragraphs[0]
        r = p.add_run()
        r.text = r_head
        r.font.name = "Inter"
        r.font.size = Pt(16)
        r.font.bold = True
        r.font.color.rgb = TEXT_WHITE

        p2 = tf.add_paragraph()
        p2.space_before = Pt(8)
        r2 = p2.add_run()
        r2.text = r_desc
        r2.font.name = "Inter"
        r2.font.size = Pt(11)
        r2.font.color.rgb = TEXT_MUTED

        p3 = tf.add_paragraph()
        p3.space_before = Pt(14)
        for b in r_bullets:
            bp = tf.add_paragraph()
            bp.space_before = Pt(6)
            br = bp.add_run()
            br.text = "→  " + b
            br.font.name = "Inter"
            br.font.size = Pt(9.5)
            br.font.color.rgb = RGBColor(200, 215, 235)

    add_footer(s15, 15)

    # =========================================================================
    # SLIDE 16: Conclusion & Executive Summary
    # =========================================================================
    s16 = prs.slides.add_slide(blank_layout)
    apply_bg(s16)

    # Central Glass Master Card
    add_glass_card(s16, Inches(1.2), Inches(1.0), Inches(10.933), Inches(5.5), border_color=RGBColor(38, 48, 68), bg_color=RGBColor(16, 21, 31))

    if os.path.exists(logo_path):
        s16.shapes.add_picture(logo_path, Inches(5.866), Inches(1.4), width=Inches(1.6), height=Inches(1.6))

    tb = s16.shapes.add_textbox(Inches(1.8), Inches(3.2), Inches(9.733), Inches(2.8))
    tf = tb.text_frame
    tf.word_wrap = True
    
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    r = p.add_run()
    r.text = "Vitalis: Eliminating Preventable Clinical Stockouts"
    r.font.name = "Inter"
    r.font.size = Pt(26)
    r.font.bold = True
    r.font.color.rgb = TEXT_WHITE

    p2 = tf.add_paragraph()
    p2.alignment = PP_ALIGN.CENTER
    p2.space_before = Pt(10)
    r2 = p2.add_run()
    r2.text = "By fusing autonomous agentic orchestration, predictive time-series modeling, and strict human clinical governance, Vitalis transforms fragile healthcare inventory silos into an infallible, life-saving collective network."
    r2.font.name = "Inter"
    r2.font.size = Pt(13)
    r2.font.color.rgb = TEXT_MUTED

    p3 = tf.add_paragraph()
    p3.alignment = PP_ALIGN.CENTER
    p3.space_before = Pt(20)
    r3 = p3.add_run()
    r3.text = "THANK YOU  ·  QUESTIONS & DISCUSSION"
    r3.font.name = "Inter"
    r3.font.size = Pt(11)
    r3.font.bold = True
    r3.font.color.rgb = ACCENT_CYAN

    add_footer(s16, 16)

    prs.save(output_path)
    print(f"✅ Master presentation successfully saved to: {output_path}")

if __name__ == "__main__":
    create_deck()
