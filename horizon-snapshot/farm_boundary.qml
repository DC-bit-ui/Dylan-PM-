<!DOCTYPE qgis PUBLIC 'http://mrcc.com/qgis.dtd' 'SYSTEM'>
<!--
  Farm Boundary style — AgriProve brand palette.
  Single-symbol renderer. No fill, red solid outline.

    Colour: #E74C3C (231,76,60)
    Outline: 0.5mm solid (~2px at standard DPI)

  Spec source: COLOUR_SPEC_FOR_HORIZON_OUTPUT.md
  Last updated: 2026-05-07.
-->
<qgis styleCategories="LayerConfiguration|Symbology|MapTips|AttributeTable|Rendering|CustomProperties|Temporal|Elevation|Notes" simplifyDrawingHints="1" simplifyDrawingTol="1" autoRefreshMode="Disabled" hasScaleBasedVisibilityFlag="0" minScale="100000000" readOnly="0" simplifyAlgorithm="0" symbologyReferenceScale="-1" maxScale="0" version="3.44.7-Solothurn" autoRefreshTime="0" simplifyLocal="1" simplifyMaxScale="1">
  <flags>
    <Identifiable>1</Identifiable>
    <Removable>1</Removable>
    <Searchable>1</Searchable>
    <Private>0</Private>
  </flags>
  <temporal endField="" limitMode="0" enabled="0" endExpression="" fixedDuration="0" mode="0" durationField="" startField="" startExpression="" accumulate="0" durationUnit="min">
    <fixedRange>
      <start></start>
      <end></end>
    </fixedRange>
  </temporal>
  <elevation clamping="Terrain" zscale="1" extrusion="0" binding="Centroid" showMarkerSymbolInSurfacePlots="0" customToleranceEnabled="1" respectLayerSymbol="1" type="IndividualFeatures" symbology="Line" zoffset="0" extrusionEnabled="0">
    <data-defined-properties>
      <Option type="Map">
        <Option value="" name="name" type="QString"/>
        <Option name="properties"/>
        <Option value="collection" name="type" type="QString"/>
      </Option>
    </data-defined-properties>
  </elevation>
  <renderer-v2 forceraster="0" referencescale="-1" symbollevels="0" enableorderby="0" type="singleSymbol">
    <symbols>
      <symbol name="0" force_rhr="0" frame_rate="10" clip_to_extent="1" alpha="1" is_animated="0" type="fill">
        <data_defined_properties>
          <Option type="Map">
            <Option value="" name="name" type="QString"/>
            <Option name="properties"/>
            <Option value="collection" name="type" type="QString"/>
          </Option>
        </data_defined_properties>
        <layer pass="0" enabled="1" id="{a1b2c3d4-e5f6-4789-abcd-ef0123456789}" class="SimpleFill" locked="0">
          <Option type="Map">
            <Option value="3x:0,0,0,0,0,0" name="border_width_map_unit_scale" type="QString"/>
            <Option value="0,0,0,0,rgb:0,0,0,0" name="color" type="QString"/>
            <Option value="bevel" name="joinstyle" type="QString"/>
            <Option value="0,0" name="offset" type="QString"/>
            <Option value="3x:0,0,0,0,0,0" name="offset_map_unit_scale" type="QString"/>
            <Option value="MM" name="offset_unit" type="QString"/>
            <Option value="231,76,60,255,rgb:0.9058824,0.2980392,0.2352941,1" name="outline_color" type="QString"/>
            <Option value="solid" name="outline_style" type="QString"/>
            <Option value="0.5" name="outline_width" type="QString"/>
            <Option value="MM" name="outline_width_unit" type="QString"/>
            <Option value="no" name="style" type="QString"/>
          </Option>
          <data_defined_properties>
            <Option type="Map">
              <Option value="" name="name" type="QString"/>
              <Option name="properties"/>
              <Option value="collection" name="type" type="QString"/>
            </Option>
          </data_defined_properties>
        </layer>
      </symbol>
    </symbols>
    <rotation/>
    <sizescale/>
    <data-defined-properties>
      <Option type="Map">
        <Option value="" name="name" type="QString"/>
        <Option name="properties"/>
        <Option value="collection" name="type" type="QString"/>
      </Option>
    </data-defined-properties>
  </renderer-v2>
  <selection mode="Default">
    <selectionColor invalid="1"/>
  </selection>
  <customproperties>
    <Option type="Map">
      <Option value="0" name="embeddedWidgets/count" type="int"/>
      <Option name="variableNames"/>
      <Option name="variableValues"/>
    </Option>
  </customproperties>
  <blendMode>0</blendMode>
  <featureBlendMode>0</featureBlendMode>
  <layerOpacity>1</layerOpacity>
  <conditionalstyles>
    <rowstyles/>
    <fieldstyles/>
  </conditionalstyles>
  <storedexpressions/>
  <mapTip enabled="1"></mapTip>
  <layerGeometryType>2</layerGeometryType>
</qgis>
