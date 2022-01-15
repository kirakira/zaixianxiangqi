package web

import (
	"embed"
	_ "embed"
	"fmt"
	"html/template"
)

//go:embed RESOURCE_VERSION
var version string

//go:embed *.html
var htmlTemplates embed.FS

func templateDefaultFuncMap() template.FuncMap {
	return map[string]interface{}{
		"assetPath": func(asset string) string {
			return fmt.Sprintf("%s?version=%s", asset, version)
		},
	}
}

func GetWebPageTemplate(filename string) *template.Template {
	return template.Must(template.New(filename).Funcs(templateDefaultFuncMap()).ParseFS(htmlTemplates, filename))
}
