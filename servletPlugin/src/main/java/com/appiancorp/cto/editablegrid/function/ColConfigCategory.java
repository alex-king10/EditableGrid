package com.appiancorp.cto.editablegrid.function;

import java.lang.annotation.*;
import com.appiancorp.suiteapi.expression.annotations.Category;

@Category("ColConfigCategory")
@Inherited
@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target({ ElementType.METHOD, ElementType.TYPE })
public @interface ColConfigCategory {
}
