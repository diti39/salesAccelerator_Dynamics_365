using System;
using Microsoft.Xrm.Sdk;

namespace SalesAccelerator.Plugins
{
    public class HelloWorldPlugin : IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {
            var tracing = (ITracingService)serviceProvider.GetService(typeof(ITracingService));
            var context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));

            tracing.Trace("Hello from the plugin! Message: {0}, Entity: {1}",
                context.MessageName, context.PrimaryEntityName);
        }
    }
}
